/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class MoviesRepository {
  constructor(
    private prisma: PrismaService
  ) {}

  async getAll() {
    const movies = await this.prisma.movie.findMany()
    return movies;
  }

  async findByIdOrName(value) {
    const movie = await this.prisma.movie.findFirst({
      where: {
        OR: {
          name: value,
          ...(typeof value == "number" && {id: value}),
        }
      }
    })

    if (!movie) return null;

    return movie;
  }

  async create({ name }) {

    const exists = await this.findByIdOrName(name);

    if (exists) throw `Room ${name} already exists`;

    const movie = {
      name,
    };

    await this.prisma.movie.create({
      data: {
        name: name
      }
    })

    return movie;
  }
}
