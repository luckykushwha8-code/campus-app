import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: any) {
    return this.prisma.post.create({ data: { content: dto.content, authorId: dto.authorId ?? 'anon' } });
  }
  async feed(query: any) {
    const limit = Number(query.limit) || 10;
    return this.prisma.post.findMany({ take: limit, orderBy: { createdAt: 'desc' } });
  }
}
