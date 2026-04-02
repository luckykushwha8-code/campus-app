import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const hash = await bcrypt.hash(dto.password, 12);
    const username = dto.email.split('@')[0] + '_' + Date.now();
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
        username,
        collegeId: dto.collegeId,
        department: dto.department,
        graduationYear: dto.graduationYear,
        isVerified: false,
      },
    });
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { ok: true, token, user: { id: user.id, email: user.email } };
  }

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { ok: false, error: 'Invalid credentials' };
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) return { ok: false, error: 'Invalid credentials' };
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { ok: true, token, user: { id: user.id, email: user.email } };
  }
}