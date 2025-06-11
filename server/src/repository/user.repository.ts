import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/drizzle.module';
import { Repository } from 'src/db/drizzle.types';
import { users } from 'src/db/schema/users';

@Injectable()
export class UserRepository {
  constructor(@Inject(DRIZZLE) private readonly repository: Repository) {}

  async getById(id: number) {
    const user = await this.repository
      .select()
      .from(users)
      .where(eq(users.id, id));

    return user[0];
  }

  async getByEmail(email: string) {
    const user = await this.repository
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user[0];
  }
}
