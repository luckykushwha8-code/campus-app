import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CampusService {
  constructor(private readonly prisma: PrismaService) {}
  async feed(limit: number) {
    const take = Math.max(1, Math.min(limit, 50));
    return this.prisma.post.findMany({ take, orderBy: { createdAt: 'desc' } });
  }
}
