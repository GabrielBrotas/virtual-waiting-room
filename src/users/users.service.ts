import { Injectable } from '@nestjs/common';
import { AuthProvider } from 'src/shared/auth/auth-provider';

const users = [];

@Injectable()
export class UsersService {
  constructor(private readonly authProvider: AuthProvider) {}

  getUser(id: string) {
    const user = users.find((u) => u.id == id);

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      user,
    };
  }

  async create({ name, email, password }) {
    const hashPassword = await this.authProvider.encrypt(password);

    const user = {
      id: Math.random().toString(),
      name,
      email,
      password: hashPassword,
    };

    users.push(user);

    return {
      success: true,
      user,
    };
  }

  async login({ email, password }) {
    const user = users.find((u) => u.email == email);

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const passwordMatch = await this.authProvider.compareEncrypt(
      password,
      user.password,
    );

    if (!passwordMatch) {
      return {
        success: false,
        error: 'email/password wrong',
      };
    }

    return {
      success: true,
      data: {
        user,
        token: await this.authProvider.generateToken(user.id),
      },
    };
  }
}
