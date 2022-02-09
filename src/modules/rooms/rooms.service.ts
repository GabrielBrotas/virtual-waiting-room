import { BadRequestException, Injectable } from '@nestjs/common';
import { RoomsRepository } from './repositories/rooms.repository';
import { SessionRepository } from './repositories/session.repository';

@Injectable()
export class RoomsService {
    constructor(
        private readonly roomsRepository: RoomsRepository,
        private readonly sessionRepository: SessionRepository
    ) {}

    async getAll() {
        const rooms = await this.roomsRepository.getAll()

        return {
            success: true,
            data: rooms
        }
    }

    async createRoom({ number, seats }) {
        try {
            const room = await this.roomsRepository.create({ number, seats })

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

    async addMovie({ room_id, movie_id, start_time }) {
        try {
            const session = await this.sessionRepository.create({ room_id, movie_id, start_time })

            return {
                success: true,
                session
            }

        } catch(err) {
            throw new BadRequestException(err.message ? err.message : err); 
        }
    }

    async buyTicket({ session_id, buyer_id }) {
        try {
            const session = await this.sessionRepository.findById(session_id)

            // if(session.)

            const new_session = await this.sessionRepository.addTicket({ buyer_id, session_id })

            return {
                success: true,
                session: new_session
            }

        } catch(err) {
            throw new BadRequestException(err.message ? err.message : err); 
        }
    }

    
    async getSession({ session_id }) {
        const session = await this.sessionRepository.findById(session_id)

        if(!session) {
            throw new BadRequestException("Room does not exists"); 
        }

        return {
            success: true,
            session
        }
    }

}
