import { Injectable } from '@nestjs/common';
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid';
import { SessionRepository } from './session.repository';

@Injectable()
export class RoomsRepository {
    constructor(
        private readonly sessionsRespository: SessionRepository,
    ) {}

    private getDB(all = false): Array<Record<string, any>> {
        const db = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'db.json'), {encoding: 'utf-8'})
        
        return all ? JSON.parse(db) : JSON.parse(db).rooms || []
    }

    private replaceData(newData) {
        const db = this.getDB(true)

        fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'db.json'), JSON.stringify({...db, rooms: newData}))
    }

    async getAll() {
        const db = this.getDB()

        for(let i = 0; i <= db.length - 1; i++) {
            const sessions = await this.sessionsRespository.findAllByRoomId(db[i]._id)

            db[i] = {
                ...db[i],
                sessions
            }
        }

        return db
    }

    async findByIdOrNumber(value: string | number) {
        const db = this.getDB()

        const room = db.find((room) => room._id == value || Number(room.number) == Number(value));

        if (!room) return null
        
        const sessions = await this.sessionsRespository.findAllByRoomId(room._id)

        room.sessions = sessions
        
        return room
    }

    async create({ number, seats }) {
        const db = this.getDB()

        const exists = await this.findByIdOrNumber(number)

        if(exists) throw "Number room already exists"
        
        const room = {
            _id: uuidv4(),
            number,
            seats
        };

        db.push(room);
        
        this.replaceData(db)

        return room
    }

}
