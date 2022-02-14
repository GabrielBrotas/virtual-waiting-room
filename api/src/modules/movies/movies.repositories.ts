/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MoviesRepository {
  // constructor() {}

  private getDB(all = false): Array<Record<string, any>> {
    const db = fs.readFileSync(path.join(__dirname, '..', '..', 'db.json'), {
      encoding: 'utf-8',
    });

    return all ? JSON.parse(db) : JSON.parse(db).movies || [];
  }

  private replaceData(newData) {
    const db = this.getDB(true);

    fs.writeFileSync(
      path.join(__dirname, '..', '..', 'db.json'),
      JSON.stringify({ ...db, movies: newData }),
    );
  }

  async getAll() {
    const db = this.getDB();
    return db;
  }

  async findByIdOrName(value: string) {
    const db = this.getDB();

    const movie = db.find((movie) => movie._id == value || movie.name == value);

    if (!movie) return null;

    return movie;
  }

  async create({ name, start_time }) {
    const db = this.getDB();

    const exists = await this.findByIdOrName(name);

    if (exists) throw `Room ${name} already exists`;

    const movie = {
      _id: uuidv4(),
      name,
      start_time,
    };

    db.push(movie);

    this.replaceData(db);

    return movie;
  }
}
