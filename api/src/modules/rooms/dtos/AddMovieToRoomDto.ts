import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class AddMovieToRoomDto {
  @IsNotEmpty()
  @IsNumber()
  movie_id: String

  @IsNotEmpty()
  @IsNumber()
  room_id: String

  @IsNotEmpty()
  @IsDateString()
  start_time: String

}
