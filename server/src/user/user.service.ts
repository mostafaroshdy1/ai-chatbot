import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserError } from './user.error';
import { HashService } from 'src/common/hash/hash.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async create(userData: CreateUserDto) {
    const foundUser = await this.userRepository.getByEmail(userData.email);
    if (foundUser) throw new BadRequestException(UserError.AlreadyExists);
    const { password } = userData;
    const hashedPassword = await this.hashService.hash(password);
    const userToCreate = {
      ...userData,
      password: hashedPassword,
    };

    return this.userRepository.create(userToCreate);
  }

  async getById(id: number) {
    const user = await this.userRepository.getById(id);
    if (!user) throw new NotFoundException(UserError.NotFound);
    return user;
  }

  async getByEmail(email: string) {
    const user = await this.userRepository.getByEmail(email);
    if (!user) throw new NotFoundException(UserError.NotFound);
    return user;
  }

  async getCurrentUserPayload(id: number) {
    const user = await this.userRepository.getById(id);
    if (!user) throw new NotFoundException(UserError.NotFound);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
