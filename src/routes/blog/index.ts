import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import { NotFoundError } from '../../core/ApiError';
import BlogRepo from '../../database/repository/BlogRepo';
import writerRoute from './writer';
import editorRoute from './editor';
import BlogCache from '../../cache/repository/BlogCache';

const blogRoute: FastifyPluginAsync = async (fastify) => {
  fastify.register(writerRoute, { prefix: '/writer' });
  fastify.register(editorRoute, { prefix: '/editor' });

  fastify.get(
    '/url',
    { preHandler: [validator(schema.blogUrl, ValidationSource.QUERY)] },
    async (req: any, reply) => {
      const blogUrl = req.query.endpoint as string;
      let blog = await BlogCache.fetchByUrl(blogUrl);

      if (!blog) {
        blog = await BlogRepo.findPublishedByUrl(blogUrl);
        if (blog) await BlogCache.save(blog);
      }

      if (!blog) throw new NotFoundError('Blog not found');
      return new SuccessResponse('success', blog).send(reply);
    },
  );

  fastify.get(
    '/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const blogId = req.params.id as string;
      let blog = await BlogCache.fetchById(blogId);

      if (!blog) {
        blog = await BlogRepo.findInfoForPublishedById(blogId);
        if (blog) await BlogCache.save(blog);
      }

      if (!blog) throw new NotFoundError('Blog not found');
      return new SuccessResponse('success', blog).send(reply);
    },
  );
};

export default blogRoute;
