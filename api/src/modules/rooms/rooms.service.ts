import { TokenProvider } from './../../shared/token/token-provider';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RoomsRepository } from './repositories/rooms.repository';
import { SessionRepository } from './repositories/session.repository';

import { getRedisClient } from '../../services/redis';
@Injectable()
export class RoomsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async getAll() {
    const rooms = await this.roomsRepository.getAll();

    return {
      success: true,
      data: rooms,
    };
  }

  async createRoom({ number, seats }) {
    try {
      const room = await this.roomsRepository.create({ number, seats });

      return {
        success: true,
        room,
      };
    } catch (err) {
      throw new BadRequestException(err.message ? err.message : err);
    }
  }

  async findOne(id) {
    const room = await this.roomsRepository.findByNumber(id);

    if (!room) {
      throw new BadRequestException('Room does not exists');
    }

    return {
      success: true,
      room,
    };
  }

  async createSession({ room_id, movie_id, start_time }) {
    try {
      const session = await this.sessionRepository.create({
        room_id,
        movie_id,
        start_time,
      });

      return {
        success: true,
        session,
      };
    } catch (err) {
      throw new BadRequestException(err.message ? err.message : err);
    }
  }

  async buyTicket({ session_id, buyer_id }) {
    try {
      const redis = await getRedisClient();
      const current_ticket = await redis.get(`main_room:${session_id}`);
      const user_ticket = this.tokenProvider.generateShaToken(buyer_id);

      if (current_ticket != user_ticket) {
        throw new BadRequestException('Wait your turn');
      }

      const session = await this.sessionRepository.findById(session_id);

      if (session.tickets.length >= session.room.seats) {
        throw new BadRequestException('Out of seats');
      }

      const new_session = await this.sessionRepository.addTicket({
        buyer_id,
        session_id,
      });

      return {
        success: true,
        session: new_session,
      };
    } catch (err) {
      throw new BadRequestException(err.message ? err.message : err);
    }
  }

  async getSession({ session_id }) {
    const session = await this.sessionRepository.findById(session_id);

    if (!session) {
      throw new BadRequestException('Session does not exists');
    }

    return {
      success: true,
      session,
    };
  }

  async deleteRedisData() {
    // delete all redis data
    const redis = await getRedisClient();

    const keys = await redis.keys('*');

    for (const key of keys) {
      await redis.del(key);
    }

    return {
      keys: keys,
    };
  }

  async getRedisData() {
    const redis = await getRedisClient();

    const keys = await redis.keys('*');

    const data = {};

    for (const key of keys) {
      data[key] = await redis.get(key);
    }

    return {
      data,
    };
  }
}
