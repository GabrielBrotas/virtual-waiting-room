import { Module } from '@nestjs/common';
import { AuthProvider } from '../../shared/auth/auth-provider';
import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service'

@Module({
    controllers: [UsersController],
    providers: [UsersService, AuthProvider, UsersRepository]
})
export class UsersModule {}
