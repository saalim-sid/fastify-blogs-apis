import { FastifyPluginAsync } from 'fastify';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import { ProtectedRequest } from '../../types/app-request';
import { SuccessMsgResponse } from '../../core/ApiResponse';
import authentication from '../../auth/authentication';

const logoutRoute: FastifyPluginAsync = async (fastify) => {
  fastify.delete(
    '/',
    { preHandler: [authentication] },
    async (req: any, reply) => {
      const keystoreId = req.keystore?.id || req.keystore?._id;
      if (keystoreId) {
        await KeystoreRepo.remove(keystoreId);
      }
      return new SuccessMsgResponse('Logout success').send(reply);
    },
  );
};

export default logoutRoute;
