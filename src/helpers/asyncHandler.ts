import { FastifyRequest, FastifyReply } from 'fastify';

type AsyncFunction = (
  req: any,
  reply: FastifyReply,
) => Promise<any>;

export default (execution: AsyncFunction) =>
  async (req: any, reply: FastifyReply): Promise<any> => {
    return execution(req, reply);
  };
