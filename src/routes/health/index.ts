import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';

const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (_req, reply) => {
    return new SuccessResponse('Success', { timestamp: new Date() }).send(reply);
  });
};

export default healthRoute;
