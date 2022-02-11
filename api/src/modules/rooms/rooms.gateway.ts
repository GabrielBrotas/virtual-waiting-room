import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { TokenProvider } from '../../shared/token/token-provider';
import { getRedisClient } from '../../services/redis';
import { SessionRepository } from './repositories/session.repository';
import { BadRequestException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VirtualRoomGateway {
  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly sessionRepository: SessionRepository,
  ) {}

  @WebSocketServer()
  server;

  @SubscribeMessage('connect')
  handleConnection(client): void {
    console.log(`New client connected => ${client.id}`);
    // this.serveer.emit('message', 'User connected');
    // emit to the client
    client.emit('hello', 'Hello world!');
  }

  @SubscribeMessage('buy-ticket')
  async buyTicket(client, { session_id, buyer_id }) {
    const redis = await getRedisClient();
    const current_ticket = await redis.get(`main_room:${session_id}`);
    const user_ticket = this.tokenProvider.generateShaToken(buyer_id);

    if (current_ticket != user_ticket) {
      client.emit('buy-ticket', {
        success: false,
        error: 'invalid ticket',
      });
      return;
    }

    const session = await this.sessionRepository.findById(session_id);

    if (session.tickets.length >= session.room.seats) {
      client.emit('buy-ticket', {
        success: false,
        error: 'out of seats',
      });
      return;
    }

    const new_session = await this.sessionRepository.addTicket({
      buyer_id,
      session_id,
    });

    await this.handleRemoveFromMainRoom(client, {
      user_id: buyer_id,
      session_id,
    });
    await this.moveWaitingRoom(session_id);

    client.emit('buy-ticket', {
      success: true,
      data: new_session,
    });
  }

  @SubscribeMessage('get-main-room')
  async handleEvent(client, data) {
    console.log({ data });
    if (!data.session_id) {
      client.emit('main-room', {
        success: false,
        error: 'session_id required',
      });
      return;
    }

    const redis = await getRedisClient();

    const ticket = await redis.get(`main_room:${data.session_id}`);

    client.emit('main-room', {
      success: true,
      ticket,
    });
    return;
  }

  @SubscribeMessage('add-to-main-room')
  async addToMainRoom(client, { user_id, session_id }) {
    if (!session_id || !user_id) {
      console.log('session_id && user_id required');
      client.emit('add-to-main-room', {
        success: false,
        error: 'session_id && user_id required',
      });
      return;
    }

    const redis = await getRedisClient();

    // generate the sha256 token
    const ticket = this.tokenProvider.generateShaToken(user_id);
    const session = await this.sessionRepository.findById(session_id);

    const waiting_room = await redis
      .get(`waiting_room:${session_id}`)
      .then((res) => (res ? JSON.parse(res) : []));

    const room = await redis.get(`main_room:${session_id}`);

    // check if the user is in the session room
    if (room == ticket) {
      console.log('same user');
      client.emit('add-to-main-room', {
        success: true,
        ticket,
      });
      return;
    }

    // check if has seats
    const ticketsAlreadySold = session.tickets.length;
    const emptySeats = session.room.seats - ticketsAlreadySold;

    if (emptySeats <= 0) {
      console.log('out of seats');

      client.emit('add-to-main-room', {
        success: false,
        error: 'out of seats',
      });
      return;
    }

    // check if has enought seat
    if (emptySeats - waiting_room.length <= 0) {
      console.log('waiting room full');

      client.emit('add-to-main-room', {
        success: false,
        error: 'waiting room full',
      });
      return;
    }

    if (room) {
      try {
        const response = await this.addToWaitingRoom({ user_id, session_id });
        client.emit('add-to-main-room', {
          success: true,
          data: response,
        });
        return;
      } catch (err) {
        console.log('error adding to waiting room');
        console.log(err);
        client.emit('add-to-main-room', {
          success: false,
          error: err.message,
        });
        return;
      }
    }

    // save the new room in redis
    await redis.set(`main_room:${session_id}`, ticket);

    console.log('added to main room');
    client.emit('add-to-main-room', {
      success: true,
      ticket,
    });
  }

  @SubscribeMessage('remove-from-main-room')
  async removeFromMainRoom(client, { user_id, session_id }) {
    await this.handleRemoveFromMainRoom(client, { user_id, session_id });
  }

  @SubscribeMessage('remove-from-waiting-room')
  async removeFromWaitingRoom(client, { user_id, session_id }) {
    console.log('remove this fck guy from waiting room');
    const redis = await getRedisClient();
    if (!user_id || !session_id) {
      console.log('user id and session id needed');
      client.emit('remove-from-waiting-room', {
        success: false,
        error: 'user_id && session_id required',
      });
      return;
    }

    const ticket = this.tokenProvider.generateShaToken(user_id);

    const waiting_room = await redis.get(`waiting_room:${session_id}`);

    if (!waiting_room) {
      console.log('Waiting room empty');
      return;
    }

    const tickets = JSON.parse(waiting_room).filter((t) => t !== ticket);

    await redis.set(`waiting_room:${session_id}`, JSON.stringify(tickets));
    console.log('removed');

    this.server.emit(`update-room:${session_id}`, {
      success: true,
    });
  }

  private async addToWaitingRoom({ user_id, session_id }) {
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
      console.log('you are in the main room');
      throw new BadRequestException('you are in the main room');
    }

    if (waiting_room.includes(ticket)) {
      console.log('already in the waiting room');
      return {
        ticket,
        isWaitingRoom: true,
        queuePosition: waiting_room.findIndex((t) => t == ticket) + 1,
      };
    }

    // check if has seats
    const ticketsAlreadySold = session.tickets.length;
    const emptySeats = session.room.seats - ticketsAlreadySold;

    if (emptySeats <= 0) {
      console.log('out of seats');
      throw new BadRequestException('out of seats');
    }

    // check if has enought seat
    if (emptySeats - waiting_room.length - (mainRoom ? 1 : 0) <= 0) {
      console.log('wait someone leave the waiting room');
      throw new BadRequestException('wait someone leave the waiting room');
    }

    const tickets = waiting_room ? [...waiting_room, ticket] : [ticket];

    await redis.set(`waiting_room:${session_id}`, JSON.stringify(tickets));

    console.log('true');

    return { ticket, isWaitingRoom: true, queuePosition: tickets.length };
  }

  private async handleRemoveFromMainRoom(client, { user_id, session_id }) {
    const redis = await getRedisClient();
    console.log('here -- remove from main rom');
    if (!session_id || !user_id) {
      client.emit('remove-from-main-room', {
        success: false,
        error: 'session_id && user_id required',
      });
      return;
    }

    const ticket = this.tokenProvider.generateShaToken(user_id);

    const room = await redis.get(`main_room:${session_id}`);

    const waiting_room = await redis
      .get(`waiting_room:${session_id}`)
      .then((res) => (res ? JSON.parse(res) : []));

    if (!room) {
      console.log('room not found');

      client.emit('remove-from-main-room', {
        success: false,
        error: 'room not found',
      });
      return;
    }

    if (room != ticket) {
      console.log('user not in room');
      client.emit('remove-from-main-room', {
        success: false,
        error: 'user not in room',
      });
      return;
    }

    await redis.del(`main_room:${session_id}`);

    const nextTicket = waiting_room[0];

    if (waiting_room.length > 0) {
      await redis.set(`main_room:${session_id}`, nextTicket);

      await redis.set(
        `waiting_room:${session_id}`,
        JSON.stringify(waiting_room.slice(1)),
      );
    }

    this.server.emit(`update-room:${session_id}`, {
      success: true,
      whoLeft: ticket,
      nextTicket,
    });

    return;
  }

  private async moveWaitingRoom(session_id) {
    const redis = await getRedisClient();

    const waiting_room = await redis
      .get(`waiting_room:${session_id}`)
      .then((res) => (res ? JSON.parse(res) : []));

    if (!waiting_room.length) {
      console.log('waiting room empty');
      return;
    }

    await redis.set(`main_room:${session_id}`, waiting_room[0]);

    await redis.set(
      `waiting_room:${session_id}`,
      JSON.stringify(waiting_room.slice(1)),
    );

    this.server.emit('move-waiting-room', {
      success: true,
      data: {
        session_id,
        waiting_room: waiting_room.slice(1),
      },
    });

    return;
  }
}
