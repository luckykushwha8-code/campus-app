import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async update(userId: string, updates: any) {
    return this.prisma.user.update({ where: { id: userId }, data: updates });
  }
}
