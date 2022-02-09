import { IsNotEmpty, IsString, IsDateString } from 'class-validator'

export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    name: String

    @IsDateString()
    start_time: String
}