import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class AuthProvider {
  private readonly saltRounds = 10;

  async encrypt(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compareEncrypt(value1: string, value2: string): Promise<boolean> {
    return await bcrypt.compare(value1, value2);
  }

  async generateToken(userId: string): Promise<string> {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: '10h',
    });
  }
}
