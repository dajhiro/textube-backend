import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async create(createChannelDto: CreateChannelDto) {
    return this.prisma.channel.create({
      data: createChannelDto,
    });
  }

  async findAll() {
    return this.prisma.channel.findMany({
      include: {
        posts: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.channel.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });
  }

  async update(id: string, updateChannelDto: UpdateChannelDto) {
    return this.prisma.channel.update({
      where: { id },
      data: updateChannelDto,
    });
  }

  async remove(id: string) {
    return this.prisma.channel.delete({
      where: { id },
    });
  }
}
