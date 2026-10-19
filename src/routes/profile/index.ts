import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import UserRepo from '../../database/repository/UserRepo';
import { ProtectedRequest } from '../../types/app-request';
import { BadRequestError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import _ from 'lodash';
import authentication from '../../auth/authentication';

const profileRoute: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authentication);

  fastify.get('/my', async (req: any, reply) => {
    const userId = req.user.id || req.user._id;
    const user = await UserRepo.findPrivateProfileById(userId);
    if (!user) throw new BadRequestError('User not registered');

    return new SuccessResponse(
      'success',
      _.pick(user, ['id', '_id', 'name', 'email', 'profilePicUrl', 'roles']),
    ).send(reply);
  });

  fastify.put(
    '/',
    { preHandler: [validator(schema.profile)] },
    async (req: any, reply) => {
      const userId = req.user.id || req.user._id;
      const user = await UserRepo.findPrivateProfileById(userId);
      if (!user) throw new BadRequestError('User not registered');

      const body = req.body as any;
      if (body.name) user.name = body.name;
      if (body.profilePicUrl) user.profilePicUrl = body.profilePicUrl;

      await UserRepo.updateInfo(user);

      const data = _.pick(user, ['name', 'profilePicUrl']);

      return new SuccessResponse('Profile updated', data).send(reply);
    },
  );
};

export default profileRoute;
