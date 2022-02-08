import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthProvider } from 'src/shared/auth/auth-provider';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly usersRepository: UsersRepository,
    ) {}

  getUser(id: string) {
    const user = this.usersRepository.findById(id)

    if (!user) throw new BadRequestException("User not found"); 

    delete user.password

    return {
      success: true,
      user,
    };
  }

  async create({ name, email, password }) {
    try {
      const user = await this.usersRepository.create({name, email, password})

      delete user.password
  
      return {
        success: true,
        user,
      };
    } catch(err) {
      throw new BadRequestException(err.message ? err.message : err); 
    }
  }

  async login({ email, password }) {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new BadRequestException("User not found"); 
    }

    const passwordMatch = await this.authProvider.compareEncrypt(
      password,
      user.password,
    );

    if (!passwordMatch) {
      throw new BadRequestException("email/password wrong"); 
    }

    delete user.password

    return {
      success: true,
      data: {
        user,
        token: await this.authProvider.generateToken(user.id),
      },
    };
  }
}
