import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { userConstants } from '../user.constants';
import { Expose } from 'class-transformer';

export class CreateUserDto {
  @MaxLength(userConstants.stringMaxLength.firstName)
  @MinLength(userConstants.stringMinLength.firstName)
  @IsString()
  @IsNotEmpty()
  @Expose()
  firstName: string;

  @MaxLength(userConstants.stringMaxLength.lastName)
  @MinLength(userConstants.stringMinLength.lastName)
  @IsString()
  @IsNotEmpty()
  @Expose()
  lastName: string;

  @MaxLength(userConstants.stringMaxLength.email)
  @MinLength(userConstants.stringMinLength.email)
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string;

  @MaxLength(userConstants.stringMaxLength.password)
  @MinLength(userConstants.stringMinLength.password)
  @IsString()
  @IsNotEmpty()
  @Expose()
  password: string;
}
