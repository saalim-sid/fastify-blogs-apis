import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import { RoleRequest } from '../../types/app-request';
import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';
import User from '../../database/model/User';
import validator from '../../helpers/validator';
import schema from './schema';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import { RoleCode } from '../../database/model/Role';
import role from '../../helpers/role';
import authorization from '../../auth/authorization';
import authentication from '../../auth/authentication';
import KeystoreRepo from '../../database/repository/KeystoreRepo';

const credentialRoute: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authentication);
  fastify.addHook('preHandler', role(RoleCode.ADMIN));
  fastify.addHook('preHandler', authorization);

  fastify.post(
    '/user/assign',
    { preHandler: [validator(schema.credential)] },
    async (req: any, reply) => {
      const body = req.body as any;
      const user = await UserRepo.findByEmail(body.email);
      if (!user) throw new BadRequestError('User do not exists');

      const passwordHash = await bcrypt.hash(body.password, 10);

      await UserRepo.updateInfo({
        id: user.id || user._id,
        password: passwordHash,
      } as User);

      await KeystoreRepo.removeAllForClient(user);

      return new SuccessResponse(
        'User password updated',
        _.pick(user, ['id', '_id', 'name', 'email']),
      ).send(reply);
    },
  );
};

export default credentialRoute;
