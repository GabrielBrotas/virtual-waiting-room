import { BadRequestException, Injectable } from '@nestjs/common';
import { MoviesRepository } from './movies.repositories';

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async getAll() {
    const movies = await this.moviesRepository.getAll();

    return {
      success: true,
      data: movies,
    };
  }

  async create({ name }) {
    try {
      const room = await this.moviesRepository.create({ name });

      return {
        success: true,
        room,
      };
    } catch (err) {
      throw new BadRequestException(err.message ? err.message : err);
    }
  }
}
