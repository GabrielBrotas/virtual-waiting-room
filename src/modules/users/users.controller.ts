import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDTO';
import { LoginUserDto } from './dtos/LoginUserDTO';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/:id')
  getUser(@Param() { id }) {
    return this.userService.getUser(id);
  }

  @Post('/register')
  create(@Body() { name, email, password }: CreateUserDto) {
    return this.userService.create({ name, email, password });
  }

  @Post('/login')
  login(@Body() { email, password }: LoginUserDto) {
    return this.userService.login({ email, password });
  }
}
