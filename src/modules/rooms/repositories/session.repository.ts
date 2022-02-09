import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid';

// import { MoviesRepository } from '../../movies/movies.repositories';
import { RoomsRepository } from './rooms.repository';

@Injectable()
export class SessionRepository {
  constructor(
    private readonly roomsRepository: RoomsRepository
  ) {}

    private getDB(all = false): Array<Record<string, any>> {
        const db = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'db.json'), {encoding: 'utf-8'})
        
        return all ? JSON.parse(db) : JSON.parse(db).sessions || []
    }

    private replaceData(newData) {
        const db = this.getDB(true)

        fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'db.json'), JSON.stringify({...db, sessions: newData}))
    }

    async getAll() {
        const db = this.getDB()

        for(let i = 0; i <= db.length - 1; i++) {
            // const movie = await this.moviesRepository.findByIdOrName(db[i].movie_id)
            const room = await this.roomsRepository.findByIdOrNumber(db[i].room_id)

            // db[i].movie = movie
            db[i].room = room
        }

        return db
    }

    async findById(value: string) {
        const db = this.getDB()

        const session = db.find((session) => session._id == value);

        if (!session) return null

        // const movie = await this.moviesRepository.findByIdOrName(session.movie_id)
        const room = await this.roomsRepository.findByIdOrNumber(session.room_id)

        // session.movie = movie
        session.room = room

        return session
    }

    async findByMovieId(value: string) {
        const db = this.getDB()

        const session = db.find((session) => session.movie_id == value);

        if (!session) return null

        // const movie = await this.moviesRepository.findByIdOrName(session.movie_id)
        const room = await this.roomsRepository.findByIdOrNumber(session.room_id)
        
        // session.movie = movie
        session.room = room

        return session
    }

    async findAllByRoomId(value: string) {
        const db = this.getDB()

        const sessions = db.filter((session) => session.room_id == value);

        if (!sessions) return null

        for(let i = 0; i <= sessions.length - 1; i++) {
            // const movie = await this.moviesRepository.findByIdOrName(sessions[i].movie_id)
            const room = await this.roomsRepository.findByIdOrNumber(sessions[i].room_id)

            // sessions[i].movie = movie
            sessions[i].room = room
        }

        return sessions
    }

    async create({ room_id, movie_id, start_time }) {
        const db = this.getDB()

        const session = {
            _id: uuidv4(),
            room_id,
            movie_id,
            start_time,
            tickets: []
        };

        db.push(session);
        
        this.replaceData(db)

        return session
    }

    async addTicket({ session_id, buyer_id }) {
        const db = this.getDB()

        const session = await this.findById(session_id)

        if(!session) return null
        
        session.tickets.push(
            {
                _id: uuidv4(),
                buyer_id,
            }
        )
        db.push(session);
        
        return session
    }

}
