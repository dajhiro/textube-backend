import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return res.redirect(`${this.configService.get('FRONTEND_URL')}?error=auth_failed`);
    }

    // 명시적으로 로그인 처리
    await new Promise<void>((resolve, reject) => {
      req.login(req.user!, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 프론트엔드로 리다이렉트
    res.redirect(this.configService.get('FRONTEND_URL') || 'http://localhost:3000');
  }

  @Get('status')
  @UseGuards(SessionAuthGuard)
  getStatus(@Req() req: Request) {
    return {
      authenticated: true,
      user: req.user,
    };
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Session destroy failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  }
}
