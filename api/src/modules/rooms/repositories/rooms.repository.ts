/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class RoomsRepository {
  constructor(
    private prisma: PrismaService  
  ) {}

  async getAll() {

    const rooms = await this.prisma.room.findMany({
      include: {
        Session: {
          include: {
            movie: true,
            tickets: true

          }
        }
      }
    })

    return rooms;
  }

  async findByNumber(value: number) {

    const room = await this.prisma.room.findFirst({
      where: {
        number: Number(value)
      },
      include: {
        Session: {
          include: {
            movie: true,
            tickets: true
          }
        }
      }
    })

    if (!room) return null;

    return room;
  }

  async create({ number, seats }) {

    const exists = await this.findByNumber(number);

    if (exists) throw 'Number room already exists';

    const room = {
      number,
      seats,
    };

    await this.prisma.room.create({
      data: {
        number,
        seats
      }
    })

    return room;
  }
}
