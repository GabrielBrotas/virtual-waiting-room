/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';


@Injectable()
export class SessionRepository {
  constructor(
      private prisma: PrismaService
  ) {}

  async getAll() {
    const sessions = await this.prisma.session.findMany({ 
      include: {
        room: true,
        movie: true,
        tickets: true
      }
    })

    return sessions;
  }

  async findById(value) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: Number(value)
      },
      include: {
        room: true,
        movie: true,
        tickets: true
      }
    })

    if (!session) return null;

    return session;
  }

  async findByMovieId(value) {
    const session = await this.prisma.session.findFirst({
      where: {
        movieId: value
      },
      include: {
        room: true,
        movie: true,
        tickets: true
      }
    })

    if (!session) return null;

    return session;
  }

  async findAllByRoomId(value) {
    const sessions = await this.prisma.session.findMany({
      where: {
        roomId: value
      },
      include: {
        room: true,
        movie: true,
        tickets: true
      }
    })

    if (!sessions) return null;

    return sessions;
  }

  async create({ room_id, movie_id, start_time }) {
    const session = {
      room_id,
      movie_id,
      start_time,
    };

    await this.prisma.session.create({
      data: {
        movieId: movie_id,
        roomId: room_id,
        start_time: start_time,
      }
    })

    return session;
  }

  async addTicket({ session_id, buyer_id }) {

    const session = await this.findById(session_id);

    if (!session) return null;

    await this.prisma.ticket.create({
      data: {
        buyerId: Number(buyer_id),
        sessionId: Number(session_id),
      }
    })

    return session;
  }

  async deleteTickets(session_id) {
    const session = await this.findById(session_id);

    if (!session) return null;

    await this.prisma.ticket.deleteMany({
      where: {
        sessionId: session_id
      }
    })

    return session;
  }
}
