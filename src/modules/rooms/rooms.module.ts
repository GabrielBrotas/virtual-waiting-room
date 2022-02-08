import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RoomsController } from './rooms.controller'
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service'
import { EnsureAuth } from '../../shared/auth/ensureAuth';

@Module({
    controllers: [RoomsController],
    providers: [RoomsService, RoomsRepository]
})
export class RoomsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
        .apply(EnsureAuth)
        .forRoutes({
            path: 'rooms',
            method: RequestMethod.POST
        });
    }
}
