import { Injectable } from '@nestjs/common';
import { AuthProvider } from 'src/shared/auth/auth-provider';
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersRepository {
  constructor(private readonly authProvider: AuthProvider) {}

    private getDB(all = false): Array<Record<string, any>> {
        const db = fs.readFileSync(path.join(__dirname, '..', '..', 'db.json'), {encoding: 'utf-8'})

        return all ? JSON.parse(db) :JSON.parse(db).users
    }

    private replaceData(newData) {
        const db = this.getDB(true)

        fs.writeFileSync(path.join(__dirname, '..', '..', 'db.json'), JSON.stringify({...db, users: newData}))
    }

    findById(id: string) {
        const db = this.getDB()

        const user = db.find((u) => u._id == id);

        if (!user) return null

        return user
    }

    findByEmail(email: string) {
        const db = this.getDB()

        const user = db.find((u) => u.email == email);

        if (!user) return null

        return user
    }

    async create({ name, email, password }) {
        const db = this.getDB()

        const emailInUse = await this.findByEmail(email)

        if(emailInUse) throw "Email Already in use"
        
        const hashPassword = await this.authProvider.encrypt(password);

        const user = {
            _id: uuidv4(),
            name,
            email,
            password: hashPassword,
        };

        db.push(user);
        
        this.replaceData(db)

        return user
    }

}
