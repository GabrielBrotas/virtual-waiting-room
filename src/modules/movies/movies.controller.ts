import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateMovieDto } from './dtos/CreateMovieDto';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Get('/')
    getAll() {
        return this.moviesService.getAll()
    }

    @Post('/')
    create(@Body() {name, start_time}: CreateMovieDto) {
        return this.moviesService.create({ name, start_time })
    }
}
