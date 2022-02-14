import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { AuthProvider } from 'src/shared/auth/auth-provider';
import db from '../../services/postgres';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly prisma: PrismaService  
  ) {}

  async findById(id: number) {

    // const user = (await db.query("SELECT * FROM users WHERE email = $1", [id])).rows[0]
    const user = await this.prisma.user.findFirst({
      where: {
        id: id
      }
    })

    if (!user) return null;

    return user;
  }

  async findByEmail(email: string) {

    // const user = (await db.query("SELECT * FROM users WHERE email = $1", [email])).rows[0]
    const user = await this.prisma.user.findFirst({
      where: {
        email: email
      }
    })
    
    if (!user) return null;

    return user;
  }

  async create({ name, email, password }) {
    
    const emailInUse = await this.findByEmail(email);
    
    if (emailInUse) throw 'Email Already in use';
    
    const hashPassword = await this.authProvider.encrypt(password);
    
    const user = {
      name,
      email,
      password: hashPassword,
    };
    
    // db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
    // [user.name, user.email, user.password])
    await this.prisma.user.create({
      data: user,
    })

    return user;
  }
}
