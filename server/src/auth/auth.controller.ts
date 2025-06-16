import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { UserModels } from 'src/user/user.models';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: UserModels.UserLoginRequest): Promise<LoginDto> {
    const loginPayload = await this.authService.login(req.user);
    return plainToInstance(LoginDto, loginPayload);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Request() req: UserModels.UserRefreshRequest,
  ): Promise<RefreshDto> {
    const refreshPayload = await this.authService.refresh(req.user);
    return plainToInstance(RefreshDto, refreshPayload);
  }
}
