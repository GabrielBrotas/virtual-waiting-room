import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class AddMovieToRoomDto {
  @IsNotEmpty()
  @IsString()
  movie_id: String

  @IsNotEmpty()
  @IsString()
  room_id: String

  @IsNotEmpty()
  @IsDateString()
  start_time: String

}
