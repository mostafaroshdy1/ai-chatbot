import { FastifyRequest } from 'fastify';
export namespace UserModels {
  // used in accessToken and refreshToken payloads
  export interface RefreshToken {
    id: number;
  }

  export interface AccessToken extends RefreshToken {}

  export interface UserLoginRequest extends FastifyRequest {
    user: AccessToken;
  }

  export interface UserRefreshRequest extends FastifyRequest {
    user: RefreshToken;
  }
}
