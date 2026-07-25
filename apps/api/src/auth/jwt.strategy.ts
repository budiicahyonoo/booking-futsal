import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret-cahyodev',
    });
  }

  async validate(payload: any) {
    // Data ini akan otomatis masuk ke dalam variabel req.user di setiap controller
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}