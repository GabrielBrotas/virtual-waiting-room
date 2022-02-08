import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TokenProvider } from './shared/token/token-provider';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './modules/rooms/rooms.module';
import { UsersModule } from './modules/users/users.module';
import { EnsureAuth } from './shared/auth/ensureAuth';
import { MoviesController } from './modules/movies/movies.controller';
import { MoviesService } from './modules/movies/movies.service';
import { MoviesModule } from './modules/movies/movies.module';

@Module({
  imports: [ConfigModule.forRoot(), RoomsModule, UsersModule, MoviesModule],
  controllers: [MoviesController],
  providers: [TokenProvider, MoviesService],
})
export class AppModule {}
