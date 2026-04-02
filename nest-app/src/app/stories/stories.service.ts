import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(dto: any) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    return this.prisma.story.create({ 
      data: { 
        image: dto.url, 
        authorId: dto.userId,
        expiresAt,
      } 
    });
  }

  async feed() {
    const now = new Date();
    return this.prisma.story.findMany({
      where: { expiresAt: { gt: now } },
      take: 20, 
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    }).catch(() => []);
  }
}