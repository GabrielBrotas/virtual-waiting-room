import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RoomsController } from './rooms.controller'
import { RoomsRepository } from './repositories/rooms.repository';
import { RoomsService } from './rooms.service'
import { EnsureAuth } from '../../shared/auth/ensureAuth';
import { SessionRepository } from './repositories/session.repository';
// import { MoviesModule } from '../movies/movies.module';

@Module({
    controllers: [RoomsController],
    // imports: [MoviesModule],
    providers: [RoomsService, RoomsRepository, SessionRepository],
})
export class RoomsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
        .apply(EnsureAuth)
        .exclude(
            {
                path: 'rooms',
                method: RequestMethod.GET
            },
            {
                path: 'rooms/(.*)',
                method: RequestMethod.GET
            },
            {
                path: 'rooms/movies(.*)',
                method: RequestMethod.GET
            }
        )
        .forRoutes(RoomsController);
    }
}
