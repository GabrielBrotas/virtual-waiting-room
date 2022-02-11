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
    const room = await this.roomsRepository.findByIdOrNumber(id);

    if (!room) {
      throw new BadRequestException('Room does not exists');
    }

    return {
      success: true,
      room,
    };
  }

  async addMovie({ room_id, movie_id, start_time }) {
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

      await this.removeFromRoom({ user_id: buyer_id, session_id });
      await this.moveWaitingRoom(session_id);

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
      throw new BadRequestException('Room does not exists');
    }

    return {
      success: true,
      session,
    };
  }

  async addToMainRoom({ user_id, session_id }) {
    const redis = await getRedisClient();

    // generate the sha256 token
    const ticket = this.tokenProvider.generateShaToken(user_id);
    const session = await this.sessionRepository.findById(session_id);

    const waiting_room = await redis
      .get(`waiting_room:${session_id}`)
      .then((res) => (res ? JSON.parse(res) : []));

    const room = await redis.get(`main_room:${session_id}`);

    // check if the user is in the session room
    if (room == ticket) return { ticket };

    // check if has seats
    const ticketsAlreadySold = session.tickets.length;
    const emptySeats = session.room.seats - ticketsAlreadySold;

    if (emptySeats <= 0) throw new BadRequestException('Out of seats');

    // check if has enought seat
    if (emptySeats - waiting_room.length <= 0) {
      throw new BadRequestException(
        'Lets see if someone for the waiting room leaves',
      );
    }

    if (room) throw new BadRequestException('Wait buyer leaves the room');

    // save the new room in redis
    await redis.set(`main_room:${session_id}`, ticket);

    return { ticket };
  }

  async getMainRoom({ session_id }) {
    const redis = await getRedisClient();

    const response = await redis.get(`main_room:${session_id}`);

    return { ticket: response };
  }

  async removeFromRoom({ user_id, session_id }) {
    const redis = await getRedisClient();

    const ticket = this.tokenProvider.generateShaToken(user_id);

    const room = await redis.get(`main_room:${session_id}`);

    if (!room) throw new BadRequestException('You are not in the room');

    if (room != ticket) throw new BadRequestException('Wait your turn');

    await redis.del(`main_room:${session_id}`);

    return { success: true };
  }

  async addToWaitingRoom({ user_id, session_id }) {
    const redis = await getRedisClient();

    // generate the sha256 token
    const ticket = this.tokenProvider.generateShaToken(user_id);
    const session = await this.sessionRepository.findById(session_id);

    const mainRoom = await redis.get(`main_room:${session_id}`);

    const waiting_room = await redis
      .get(`waiting_room:${session_id}`)
      .then((res) => (res ? JSON.parse(res) : []));

    // check if are in the main room
    if (mainRoom == ticket) {
      throw new BadRequestException('You are already in the main room');
    }

    if (waiting_room.includes(ticket)) return { tickets: waiting_room };

    // check if has seats
    const ticketsAlreadySold = session.tickets.length;
    const emptySeats = session.room.seats - ticketsAlreadySold;

    if (emptySeats <= 0) {
      throw new BadRequestException('Out of seats');
    }

    // check if has enought seat
    if (emptySeats - waiting_room.length - (mainRoom ? 1 : 0) <= 0) {
      throw new BadRequestException('Wait someone leave the waiting room');
    }

    const tickets = waiting_room ? [...waiting_room, ticket] : [ticket];

    await redis.set(`waiting_room:${session_id}`, JSON.stringify(tickets));

    return { tickets };
  }

  async getWaitingRoom({ session_id }) {
    const redis = await getRedisClient();

    const response = await redis.get(`waiting_room:${session_id}`);

    if (!response) return [];

    return { tickets: JSON.parse(response) };
  }

  async removeFromWaitingRoom({ user_id, session_id }) {
    const redis = await getRedisClient();

    const ticket = this.tokenProvider.generateShaToken(user_id);

    // get the current waiting room
    const waiting_room = await redis.get(`waiting_room:${session_id}`);

    if (!waiting_room) return [];

    const tickets = JSON.parse(waiting_room).filter((t) => t !== ticket);

    await redis.set(`waiting_room:${session_id}`, JSON.stringify(tickets));

    return tickets;
  }

  private async moveWaitingRoom(session_id) {
    const redis = await getRedisClient();
    const waiting_room = await redis
      .get(`waiting_room:${session_id}`)
      .then((res) => (res ? JSON.parse(res) : []));

    if (!waiting_room.length) return;

    await redis.set(`main_room:${session_id}`, waiting_room[0]);

    await redis.set(
      `waiting_room:${session_id}`,
      JSON.stringify(waiting_room.slice(1)),
    );

    return;
  }

  async clearMovieTickets(session_id) {
    await this.sessionRepository.deleteTickets(session_id);

    return;
  }
}
