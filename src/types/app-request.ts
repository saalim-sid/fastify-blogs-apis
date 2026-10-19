import { FastifyRequest } from 'fastify';
import User from '../database/model/User';
import Keystore from '../database/model/Keystore';
import ApiKey from '../database/model/ApiKey';

declare module 'fastify' {
  interface FastifyRequest {
    apiKey?: ApiKey;
    currentRoleCodes?: string[];
    user?: User;
    accessToken?: string;
    keystore?: Keystore;
  }
}

export interface PublicRequest extends FastifyRequest {
  apiKey: ApiKey;
}

export interface RoleRequest extends PublicRequest {
  currentRoleCodes: string[];
}

export interface ProtectedRequest extends RoleRequest {
  user: User;
  accessToken: string;
  keystore: Keystore;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
