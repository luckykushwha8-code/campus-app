import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { OtpService } from './otp.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private otpService = new OtpService();

  @Post('register')
  @HttpCode(201)
  register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: any) {
    return this.authService.login(dto);
  }

  @Post('send-otp')
  sendOtp(@Body() dto: any) {
    const code = this.otpService.generate(dto.email);
    return { ok: true, email: dto.email, otpSent: true, code };
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: any) {
    const ok = this.otpService.verify(dto.email, dto.otp);
    return { ok, email: dto.email };
  }
}
