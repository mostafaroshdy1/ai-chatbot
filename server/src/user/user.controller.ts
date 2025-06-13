import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResDto } from './dto/user-res.dto';
import { plainToInstance } from 'class-transformer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResDto> {
    const createdUser = await this.userService.create(createUserDto);
    return plainToInstance(UserResDto, createdUser);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResDto> {
    const user = await this.userService.getById(id);
    return plainToInstance(UserResDto, user);
  }
}
