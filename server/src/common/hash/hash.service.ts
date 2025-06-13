import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashService {
  hash(data: string): Promise<string> {
    return argon2.hash(data);
  }

  compare(data: string, hashedData: string): Promise<boolean> {
    return argon2.verify(hashedData, data);
  }
}
