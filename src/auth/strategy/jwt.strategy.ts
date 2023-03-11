import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { primsaErrorHandling } from 'src/prisma/exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
  async validate(payload: { id: number }) {
    try {
      const user = await this.prisma.authentication_user.findUnique({
        where: { id: BigInt(payload.id) },
      });
      return user;
    } catch (error) {
      primsaErrorHandling(error);
    }
  }
}
