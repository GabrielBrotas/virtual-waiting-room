import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { AddMovieToRoomDto } from './dtos/AddMovieToRoomDto';
import { CreateRoomDto } from './dtos/CreateRoomDto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('/')
  getAll() {
    return this.roomsService.getAll();
  }

  @Post('/')
  create(@Body() { number, seats }: CreateRoomDto, @Req() req) {
    return this.roomsService.createRoom({ number, seats });
  }

  @Get('/:id')
  getOne(@Param() { id }) {
    return this.roomsService.findOne(id);
  }

  @Post('/movie')
  createSession(@Body() { movie_id, start_time, room_id }: AddMovieToRoomDto) {
    return this.roomsService.addMovie({ movie_id, room_id, start_time });
  }

  @Get('/movie/:SessionID')
  getSession(@Param() { SessionID }) {
    return this.roomsService.getSession({ session_id: SessionID });
  }

  @Post('/movie/:SessionID')
  buyTicket(@Param() { SessionID }, @Req() req) {
    return this.roomsService.buyTicket({
      buyer_id: req.user._id,
      session_id: SessionID,
    });
  }

  @Post('/movie/:SessionID/room')
  addToMainRoom(@Param() { SessionID }, @Req() req) {
    return this.roomsService.addToMainRoom({
      user_id: req.user._id,
      session_id: SessionID,
    });
  }

  @Get('/movie/:SessionID/room')
  getMainRoom(@Param() { SessionID }) {
    return this.roomsService.getMainRoom({ session_id: SessionID });
  }

  @Delete('/movie/:SessionID/room')
  removeFromSessionRoom(@Param() { SessionID }, @Req() req) {
    return this.roomsService.removeFromRoom({
      user_id: req.user._id,
      session_id: SessionID,
    });
  }

  @Post('/movie/:SessionID/waiting-room')
  addToWaitingRoom(@Param() { SessionID }, @Req() req) {
    return this.roomsService.addToWaitingRoom({
      user_id: req.user._id,
      session_id: SessionID,
    });
  }

  @Get('/movie/:SessionID/waiting-room')
  getWaitingRoom(@Param() { SessionID }) {
    return this.roomsService.getWaitingRoom({ session_id: SessionID });
  }

  @Delete('/movie/:SessionID/waiting-room')
  removeFromWaitingRoom(@Param() { SessionID }, @Req() req) {
    return this.roomsService.removeFromWaitingRoom({
      user_id: req.user._id,
      session_id: SessionID,
    });
  }

  @Delete('/movie/:SessionID/tickets')
  removeTicket(@Param() { SessionID }) {
    return this.roomsService.clearMovieTickets(SessionID);
  }
}
