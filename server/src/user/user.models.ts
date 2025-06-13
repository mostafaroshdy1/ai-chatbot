import { Request } from 'express';

export namespace UserModels {
  // used in accessToken and refreshToken payloads
  export interface RefreshToken {
    id: number;
  }

  export interface AccessToken extends RefreshToken {}

  export interface UserLoginRequest extends Request {
    user: AccessToken;
  }

  export interface UserRefreshRequest extends Request {
    user: RefreshToken;
  }
}
