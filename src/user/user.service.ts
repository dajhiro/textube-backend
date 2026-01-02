import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, name?: string) {
    return this.prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne() {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, name: string) {
    return this.prisma.user.update({
      where: { id },
      data: { name },
    });
  }
  
  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
