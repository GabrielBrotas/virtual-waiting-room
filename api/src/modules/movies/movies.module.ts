import {
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { EnsureAuth } from 'src/shared/auth/ensureAuth';
import { MoviesController } from './movies.controller';
import { MoviesRepository } from './movies.repositories';
import { MoviesService } from './movies.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, MoviesRepository, PrismaService],
  exports: [MoviesRepository],
})
export class MoviesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EnsureAuth).forRoutes({
      method: RequestMethod.POST,
      path: 'movies',
    });
  }
}
