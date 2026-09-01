import { Controller, Post, Body, UnauthorizedException, Res, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    // 1. Cek kredensial via Service
    const user = await this.authService.validateUser(body.email, body.password);
    
    if (!user) {
      throw new UnauthorizedException('Email atau Password salah');
    }

    // 2. Jika valid, buat token
    const tokens = await this.authService.login(user);

    // 3. Simpan Refresh Token ke HTTP-Only Cookie (sangat aman)
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 4. Kembalikan Access Token ke frontend untuk disimpan di memory
    return {
      message: 'Login berhasil',
      user: tokens.user,
      access_token: tokens.access_token,
    };
  }

  // --- GOOGLE OAUTH ROUTES ---
  
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Otomatis dialihkan ke halaman login Google oleh Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    // req.user berisi data profil dari GoogleStrategy
    const tokens = await this.authService.login(req.user);

    // Tanamkan access_token di cookie agar Next.js bisa membacanya
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

    // Tendang kembali ke frontend utama (dashboard)
    res.redirect('http://localhost:3000/choice');
  }
}