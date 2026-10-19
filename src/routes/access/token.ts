import { FastifyPluginAsync } from 'fastify';
import { TokenRefreshResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from '../../types/app-request';
import UserRepo from '../../database/repository/UserRepo';
import { AuthFailureError } from '../../core/ApiError';
import JWT from '../../core/JWT';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import crypto from 'crypto';
import {
  validateTokenData,
  createTokens,
  getAccessToken,
} from '../../auth/authUtils';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';

const tokenRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/refresh',
    {
      preHandler: [
        validator(schema.auth, ValidationSource.HEADER),
        validator(schema.refreshToken),
      ],
    },
    async (req: any, reply) => {
      req.accessToken = getAccessToken(req.headers.authorization);

      const accessTokenPayload = await JWT.decode(req.accessToken);
      validateTokenData(accessTokenPayload);

      const user = await UserRepo.findById(accessTokenPayload.sub);
      if (!user) throw new AuthFailureError('User not registered');
      req.user = user;

      const refreshTokenPayload = await JWT.validate(req.body.refreshToken);
      validateTokenData(refreshTokenPayload);

      if (accessTokenPayload.sub !== refreshTokenPayload.sub) {
        throw new AuthFailureError('Invalid access token');
      }

      const keystore = await KeystoreRepo.find(
        req.user,
        accessTokenPayload.prm,
        refreshTokenPayload.prm,
      );

      if (!keystore) throw new AuthFailureError('Invalid access token');
      const keystoreId = keystore.id || keystore._id;
      if (keystoreId) {
        await KeystoreRepo.remove(keystoreId);
      }

      const accessTokenKey = crypto.randomBytes(64).toString('hex');
      const refreshTokenKey = crypto.randomBytes(64).toString('hex');

      await KeystoreRepo.create(req.user, accessTokenKey, refreshTokenKey);
      const tokens = await createTokens(
        req.user,
        accessTokenKey,
        refreshTokenKey,
      );

      return new TokenRefreshResponse(
        'Token Issued',
        tokens.accessToken,
        tokens.refreshToken,
      ).send(reply);
    },
  );
};

export default tokenRoute;
