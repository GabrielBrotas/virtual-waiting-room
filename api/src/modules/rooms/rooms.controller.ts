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
    return this.roomsService.createSession({ movie_id, room_id, start_time });
  }

  @Get('/movie/:SessionID')
  getSession(@Param() { SessionID }) {
    return this.roomsService.getSession({ session_id: SessionID });
  }

  @Post('/movie/:SessionID')
  buyTicket(@Param() { SessionID }, @Req() req) {
    return this.roomsService.buyTicket({
      buyer_id: req.user.id,
      session_id: SessionID,
    });
  }

  @Delete('/redis')
  deleteRedisData() {
    return this.roomsService.deleteRedisData();
  }

  @Get('/redis/data')
  getRedisData() {
    return this.roomsService.getRedisData();
  }
}
