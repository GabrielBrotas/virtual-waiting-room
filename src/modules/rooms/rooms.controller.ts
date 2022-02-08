import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateRoomDto } from './dtos/CreateRoomDto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get('/')
    getAll() {
        return this.roomsService.getAll()
    }

    @Post('/')
    create(@Body() { number }: CreateRoomDto) {
        return this.roomsService.createRoom({ number })
    }

    @Get('/:id')
    getOne(@Param() {id}) {
        return this.roomsService.findOne(id)
    }

}
