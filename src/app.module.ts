import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { TokenProvider } from './shared/token/token-provider';
import { AuthProvider } from './shared/auth/auth-provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [UsersController],
  providers: [UsersService, TokenProvider, AuthProvider],
})
export class AppModule {}
