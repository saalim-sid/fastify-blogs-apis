import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse, SuccessMsgResponse } from '../../core/ApiResponse';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import BlogRepo from '../../database/repository/BlogRepo';
import { RoleCode } from '../../database/model/Role';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import authentication from '../../auth/authentication';
import authorization from '../../auth/authorization';
import role from '../../helpers/role';

const editorRoute: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authentication);
  fastify.addHook('preHandler', role(RoleCode.ADMIN, RoleCode.EDITOR));
  fastify.addHook('preHandler', authorization);

  fastify.put(
    '/publish/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const params = req.params as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);
      if (!blog) throw new BadRequestError('Blog does not exists');

      blog.isDraft = false;
      blog.isSubmitted = false;
      blog.isPublished = true;
      blog.text = blog.draftText;
      if (!blog.publishedAt) blog.publishedAt = new Date();
      blog.updatedById = req.user.id || req.user._id;

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog published successfully').send(reply);
    },
  );

  fastify.put(
    '/unpublish/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const params = req.params as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);
      if (!blog) throw new BadRequestError('Blog does not exists');

      blog.isDraft = true;
      blog.isSubmitted = false;
      blog.isPublished = false;
      blog.updatedById = req.user.id || req.user._id;

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog unpublished successfully').send(reply);
    },
  );

  fastify.delete(
    '/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const params = req.params as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);
      if (!blog) throw new BadRequestError('Blog does not exists');

      blog.status = false;
      blog.updatedById = req.user.id || req.user._id;

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog deleted successfully').send(reply);
    },
  );

  fastify.get('/published/all', async (_req, reply) => {
    const blogs = await BlogRepo.findAllPublished();
    return new SuccessResponse('success', blogs).send(reply);
  });

  fastify.get('/submitted/all', async (_req, reply) => {
    const blogs = await BlogRepo.findAllSubmissions();
    return new SuccessResponse('success', blogs).send(reply);
  });

  fastify.get('/drafts/all', async (_req, reply) => {
    const blogs = await BlogRepo.findAllDrafts();
    return new SuccessResponse('success', blogs).send(reply);
  });

  fastify.get(
    '/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const params = req.params as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);

      if (!blog) throw new BadRequestError('Blog does not exists');
      if (!blog.isSubmitted && !blog.isPublished) {
        throw new ForbiddenError('This blog is private');
      }

      return new SuccessResponse('success', blog).send(reply);
    },
  );
};

export default editorRoute;
