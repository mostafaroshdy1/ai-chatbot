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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: UserModels.UserLoginRequest) {
    return this.authService.login(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(@Request() req: UserModels.UserRefreshRequest) {
    return this.authService.refresh(req.user);
  }
}
