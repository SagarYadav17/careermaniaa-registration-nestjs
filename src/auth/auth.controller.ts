import { Body, Controller, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, GetOTPDto, OTPDto, UpdateUserDto } from './dto';
import { JwtGuard } from './guard';
import { GetUser } from './decorator';
import { authentication_user } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('get-otp')
  getOTP(@Body() dto: GetOTPDto) {
    return this.authService.GetOTP(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('validate-otp')
  validateOTP(@Body() dto: OTPDto) {
    return this.authService.validateOTP(dto);
  }

  @UseGuards(JwtGuard)
  @Patch('user')
  updateProfile(@GetUser() user: authentication_user, @Body() dto: UpdateUserDto) {
    return this.authService.updateProfile(user, dto);
  }
}
