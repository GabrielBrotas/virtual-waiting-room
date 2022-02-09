import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TokenProvider } from './shared/token/token-provider';
import { RoomsModule } from './modules/rooms/rooms.module';
import { UsersModule } from './modules/users/users.module';
import { MoviesModule } from './modules/movies/movies.module';

@Module({
  imports: [ConfigModule.forRoot(), RoomsModule, MoviesModule, UsersModule, ],
  controllers: [],
  providers: [TokenProvider],
  exports: []
})
export class AppModule {}
