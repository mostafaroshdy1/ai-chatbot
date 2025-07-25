import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/drizzle.module';
import { Repository } from 'src/db/drizzle.types';
import { users } from 'src/db/schema/users';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(@Inject(DRIZZLE) private readonly repository: Repository) {}

  async getById(id: number) {
    const [user] = await this.repository
      .select()
      .from(users)
      .where(eq(users.id, id));

    return user ? user : null;
  }

  async getByEmail(email: string) {
    const [user] = await this.repository
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user ? user : null;
  }

  async create(data: CreateUserDto) {
    const [user] = await this.repository.insert(users).values(data).returning({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      createdAt: users.createdAt,
    });

    return user;
  }
}
