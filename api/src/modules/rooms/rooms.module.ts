import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsRepository } from './repositories/rooms.repository';
import { RoomsService } from './rooms.service';
import { EnsureAuth } from '../../shared/auth/ensureAuth';
import { SessionRepository } from './repositories/session.repository';
import { MoviesModule } from '../movies/movies.module';
import { TokenProvider } from './../../shared/token/token-provider';
import { VirtualRoomGateway } from './rooms.gateway';

@Module({
  controllers: [RoomsController],
  providers: [
    RoomsService,
    SessionRepository,
    RoomsRepository,
    TokenProvider,
    VirtualRoomGateway,
  ],
  imports: [MoviesModule],
})
export class RoomsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EnsureAuth)
      .exclude(
        {
          path: 'rooms',
          method: RequestMethod.GET,
        },
        {
          path: 'rooms/(.*)',
          method: RequestMethod.GET,
        },
        {
          path: 'rooms/movie(.*)',
          method: RequestMethod.GET,
        },
      )
      .forRoutes(RoomsController);
  }
}
