import { CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, OTPDto, GetOTPDto, UpdateUserDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { primsaErrorHandling } from '../prisma/exception';
import { Cache } from 'cache-manager';
import { authentication_user } from '@prisma/client';

function generateOTP(length: number = 6): number {
  return parseInt(
    Math.random()
      .toString()
      .substring(2, 2 + length),
  );
}

function toJson(data) {
  return JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? `${v}n` : v)).replace(/"(-?\d+)n"/g, (_, a) => a);
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Create access token
  async signToken(userId: number): Promise<{ access_token: string }> {
    const accessToken = await this.jwt.signAsync(
      { id: userId },
      {
        expiresIn: '30m',
        secret: this.config.get('JWT_SECRET'),
      },
    );

    return { access_token: accessToken };
  }

  async hashPassword(password: string) {
    return await argon.hash(password, {
      memoryCost: 102400,
      parallelism: 8,
      timeCost: 2,
    });
  }

  async signup(dto: AuthDto) {
    const passwordHash = await this.hashPassword(dto.password);
    try {
      // Create User
      const profile = await this.prisma.authentication_profile.create({
        data: {
          name: dto.phonenumber,
          is_active: false,
          whatsapp_number: dto.phonenumber,
        },
        select: { id: true },
      });
      const user = await this.prisma.authentication_user.create({
        data: {
          password: `argon2${passwordHash}`,
          is_superuser: false,
          created_at: new Date(),
          updated_at: new Date(),
          phonenumber: dto.phonenumber,
          username: dto.phonenumber,
          is_active: true,
          is_staff: false,
          profile_id: profile.id,
          usergroup_id: dto.usergroup_id,
        },
        select: { id: true },
      });

      // Return Access Token
      return this.signToken(Number(user.id));
    } catch (error) {
      primsaErrorHandling(error);
    }
  }

  async GetOTP(dto: GetOTPDto) {
    try {
      await this.prisma.authentication_user.findUniqueOrThrow({
        where: { phonenumber: dto.phonenumber },
      });

      if (this.config.get('STACK') == 'development') {
        var otp = 123456;
      } else {
        var otp = generateOTP();
      }

      // valid for 5 mintues
      await this.cacheManager.set(dto.phonenumber, otp, 5 * 60000);

      return { message: `New OTP is generated ${otp}` };
    } catch (error) {
      primsaErrorHandling(error);
    }
  }

  async validateOTP(dto: OTPDto) {
    try {
      const user = await this.prisma.authentication_user.findUniqueOrThrow({
        where: { phonenumber: dto.phonenumber },
        select: { id: true },
      });
      var otp_item = await this.cacheManager.get(dto.phonenumber);

      if (otp_item != dto.otp) {
        throw new HttpException({ message: 'Invalid OTP' }, HttpStatus.BAD_REQUEST);
      }

      // Delete OTP
      await this.cacheManager.del(dto.phonenumber);

      // Return Access Token
      return this.signToken(Number(user.id));
    } catch (error) {
      primsaErrorHandling(error);
    }
  }

  async updateProfile(user: authentication_user, dto: UpdateUserDto) {
    try {
      // Update Profile
      if (dto.profile) {
        await this.prisma.authentication_profile.update({
          where: { id: user.profile_id },
          data: { ...dto.profile },
        });
      }

      // Create Bank Detail
      if (dto.bankdetail) {
        const prev_back_details = await this.prisma.authentication_bankdetail.findFirst({
          where: { ...dto.bankdetail },
        });
        if (!prev_back_details) {
          await this.prisma.authentication_bankdetail.create({
            data: {
              account_holder_name: dto.bankdetail['account_holder_name'],
              account_number: dto.bankdetail['account_number'],
              branch_name: dto.bankdetail['branch_name'],
              ifsc_code: dto.bankdetail['ifsc_code'],
              bank_id: dto.bankdetail['bank_id'],
              profile_id: user.profile_id,
              attachment: dto.bankdetail['attachment'],
            },
            select: { id: true },
          });
        }
      }

      // Return Data
      const user_data = await this.prisma.authentication_profile.findUniqueOrThrow({
        where: { id: user.profile_id },
      });

      const bank_details = await this.prisma.authentication_bankdetail.findMany({
        where: { profile_id: user.profile_id },
        include: { authentication_bankname: true },
      });

      const data = user_data;
      data['bankdetail'] = bank_details;

      return JSON.parse(toJson(data));
    } catch (error) {
      primsaErrorHandling(error);
    }
  }
}
