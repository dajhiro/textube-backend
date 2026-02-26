import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  GetPostsQueryDto,
  GetPostsResponseDto,
} from './dto/get-posts-query.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: createPostDto,
      include: {
        user: true,
      },
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      include: {
        channel: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllPublic(
    query: GetPostsQueryDto,
  ): Promise<GetPostsResponseDto> {
    const { cursor, limit = 20, category, tag } = query;

    // Build where clause
    const where: any = {
      isPublic: true,
      isReady: true, // 준비된 게시글만
    };

    if (category) {
      where.category = category;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    // Cursor-based pagination
    if (cursor) {
      where.id = {
        lt: cursor, // cursor보다 작은 ID (최신순이므로)
      };
    }

    // Fetch limit + 1 to check if there's a next page
    const posts = await this.prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Check if there's a next page
    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return {
      posts: result,
      nextCursor,
      hasMore,
    };
  }

  async findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        channel: true,
      },
    });
  }

  async findByUserId(userId: number) {
    return this.prisma.post.findMany({
      where: { userId },
      include: {
        channel: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        user: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
