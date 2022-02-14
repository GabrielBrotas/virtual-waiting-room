import { Module } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { AuthProvider } from 'src/shared/auth/auth-provider';
import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service'

@Module({
    controllers: [UsersController],
    providers: [UsersService, AuthProvider, UsersRepository, PrismaService]
})
export class UsersModule {}
