import { Controller, Post, Get, Patch, Body, UnauthorizedException, Res, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { identifier: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.identifier, body.password);
    if (!user) throw new UnauthorizedException('Email/No. HP atau password salah');

    const tokens = await this.authService.login(user);

    // Refresh token di HTTP-Only cookie (aman, tidak bisa dibaca JS)
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login berhasil',
      user: tokens.user,
      access_token: tokens.access_token,
    };
  }

  @Post('register')
  register(@Body() body: { name: string; phone: string; email?: string; password: string }) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateMe(@Req() req: any, @Body() body: { name?: string; phone?: string; email?: string }) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Post('request-reset')
  requestReset(@Body() body: { identifier: string }) {
    return this.authService.requestPasswordReset(body.identifier);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { identifier: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(body.identifier, body.otp, body.newPassword);
  }

  // --- GOOGLE OAUTH (dipertahankan dari fondasi CayLabs) ---

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Otomatis dialihkan ke halaman login Google oleh Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const tokens = await this.authService.login(req.user);
    res.cookie('access_token', tokens.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect('http://localhost:3000/choice');
  }
}
