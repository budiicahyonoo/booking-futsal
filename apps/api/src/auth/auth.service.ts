import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  /** OTP reset password in-memory (V1); production: pindah ke Redis */
  private otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /** Validasi kredensial: email ATAU nomor HP (FR-AUTH-02) */
  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-cahyodev',
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      access_token: accessToken,
      refreshToken,
    };
  }

  /** Registrasi akun Member (FR-AUTH-01): nama, No. HP, email opsional, password */
  async register(dto: { name: string; phone: string; email?: string; password: string }) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ phone: dto.phone }, ...(dto.email ? [{ email: dto.email }] : [])] },
    });
    if (existing) {
      throw new ConflictException('No. HP atau email sudah terdaftar');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          email: dto.email ?? null,
          password: hashed,
          role: 'MEMBER',
        },
      });
      await tx.member.create({ data: { userId: user.id } });
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      };
    });
  }

  /** Password reset via OTP (FR-AUTH-05) */
  async requestPasswordReset(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    // Jangan bocorkan keberadaan akun
    if (!user) return { message: 'Jika akun terdaftar, OTP telah dikirim.' };

    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.otpStore.set(identifier, { code, expiresAt: Date.now() + 10 * 60_000 });
    // V1: OTP "dikirim" via logger (fallback email/WA - PRD 12.1).
    // TODO fase 2: integrasi provider WA/email.
    console.log(`[OTP] Reset password untuk ${identifier}: ${code}`);
    return { message: 'Jika akun terdaftar, OTP telah dikirim.' };
  }

  async resetPassword(identifier: string, otp: string, newPassword: string) {
    const entry = this.otpStore.get(identifier);
    if (!entry || entry.expiresAt < Date.now() || entry.code !== otp) {
      throw new BadRequestException('OTP tidak valid atau kedaluwarsa');
    }
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    this.otpStore.delete(identifier);
    return { message: 'Password berhasil direset' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        isRegularMember: true,
        memberProfile: {
          select: { type: true, totalBooking: true, totalSpend: true, lastBookingAt: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async updateProfile(userId: string, dto: { name?: string; phone?: string; email?: string }) {
    // FR-MEMBER-01
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) {
      const dup = await this.prisma.user.findFirst({
        where: { phone: dto.phone, NOT: { id: userId } },
      });
      if (dup) throw new ConflictException('No. HP sudah digunakan akun lain');
      data.phone = dto.phone;
    }
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  }
}
