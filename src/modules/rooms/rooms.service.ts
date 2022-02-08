import { BadRequestException, Injectable } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';

@Injectable()
export class RoomsService {
    constructor(private readonly roomsRepository: RoomsRepository) {}

    async getAll() {
        const rooms = await this.roomsRepository.getAll()

        return {
            success: true,
            data: rooms
        }
    }

    async createRoom({ number }) {
        try {
            const room = await this.roomsRepository.create({ number })

            return {
                success: true,
                room
            }

        } catch(err) {
            throw new BadRequestException(err.message ? err.message : err); 
        }
    }

    async findOne(id) {
        const room = await this.roomsRepository.findByIdOrNumber(id)

        if(!room) {
            throw new BadRequestException("Room does not exists"); 
        }

        return {
            success: true,
            room
        }
    }
}
