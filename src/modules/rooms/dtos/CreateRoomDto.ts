import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsNumber()
  seats: number
}
