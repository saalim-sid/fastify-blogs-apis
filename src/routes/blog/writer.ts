import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse, SuccessMsgResponse } from '../../core/ApiResponse';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import BlogRepo from '../../database/repository/BlogRepo';
import Blog from '../../database/model/Blog';
import { RoleCode } from '../../database/model/Role';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import authentication from '../../auth/authentication';
import authorization from '../../auth/authorization';
import role from '../../helpers/role';

const formatEndpoint = (endpoint: string) =>
  endpoint.replace(/\s/g, '').replace(/\//g, '-').replace(/\?/g, '');

function isAuthor(blog: Blog, user: any): boolean {
  const userId = user.id || user._id;
  const authorId = blog.authorId || blog.author?.id || blog.author?._id;
  return authorId === userId;
}

const writerRoute: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authentication);
  fastify.addHook('preHandler', role(RoleCode.WRITER));
  fastify.addHook('preHandler', authorization);

  fastify.post(
    '/',
    { preHandler: [validator(schema.blogCreate)] },
    async (req: any, reply) => {
      const body = req.body as any;
      body.blogUrl = formatEndpoint(body.blogUrl);

      const blog = await BlogRepo.findUrlIfExists(body.blogUrl);
      if (blog) throw new BadRequestError('Blog with this url already exists');

      const createdBlog = await BlogRepo.create({
        title: body.title,
        description: body.description,
        draftText: body.text,
        tags: body.tags,
        author: req.user,
        authorId: req.user.id || req.user._id,
        blogUrl: body.blogUrl,
        imgUrl: body.imgUrl,
        score: body.score,
        createdBy: req.user,
        updatedBy: req.user,
      } as Blog);

      return new SuccessResponse('Blog created successfully', createdBlog).send(reply);
    },
  );

  fastify.put(
    '/id/:id',
    {
      preHandler: [
        validator(schema.blogId, ValidationSource.PARAM),
        validator(schema.blogUpdate),
      ],
    },
    async (req: any, reply) => {
      const params = req.params as any;
      const body = req.body as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);
      if (blog == null) throw new BadRequestError('Blog does not exists');
      if (!isAuthor(blog, req.user)) {
        throw new ForbiddenError("You don't have necessary permissions");
      }

      if (body.blogUrl && blog.blogUrl !== body.blogUrl) {
        const endpoint = formatEndpoint(body.blogUrl);
        const existingBlog = await BlogRepo.findUrlIfExists(endpoint);
        if (existingBlog) throw new BadRequestError('Blog URL already used');
        blog.blogUrl = endpoint;
      }

      if (body.title) blog.title = body.title;
      if (body.description) blog.description = body.description;
      if (body.text) blog.draftText = body.text;
      if (body.tags) blog.tags = body.tags;
      if (body.imgUrl) blog.imgUrl = body.imgUrl;
      if (body.score !== undefined) blog.score = body.score;

      blog.updatedById = req.user.id || req.user._id;

      await BlogRepo.update(blog);
      return new SuccessResponse('Blog updated successfully', blog).send(reply);
    },
  );

  fastify.put(
    '/submit/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const params = req.params as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);
      if (!blog) throw new BadRequestError('Blog does not exists');
      if (!isAuthor(blog, req.user)) {
        throw new ForbiddenError("You don't have necessary permissions");
      }

      blog.isSubmitted = true;
      blog.isDraft = false;
      blog.updatedById = req.user.id || req.user._id;

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog submitted successfully').send(reply);
    },
  );

  fastify.put(
    '/withdraw/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const params = req.params as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);
      if (!blog) throw new BadRequestError('Blog does not exists');
      if (!isAuthor(blog, req.user)) {
        throw new ForbiddenError("You don't have necessary permissions");
      }

      blog.isSubmitted = false;
      blog.isDraft = true;
      blog.updatedById = req.user.id || req.user._id;

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog withdrawn successfully').send(reply);
    },
  );

  fastify.delete(
    '/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const params = req.params as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);
      if (!blog) throw new BadRequestError('Blog does not exists');
      if (!isAuthor(blog, req.user)) {
        throw new ForbiddenError("You don't have necessary permissions");
      }

      if (blog.isPublished) {
        blog.isDraft = false;
        blog.draftText = blog.text || '';
      } else {
        blog.status = false;
      }
      blog.updatedById = req.user.id || req.user._id;

      await BlogRepo.update(blog);
      return new SuccessMsgResponse('Blog deleted successfully').send(reply);
    },
  );

  fastify.get('/submitted/all', async (req: any, reply) => {
    const blogs = await BlogRepo.findAllSubmissionsForWriter(req.user);
    return new SuccessResponse('success', blogs).send(reply);
  });

  fastify.get('/published/all', async (req: any, reply) => {
    const blogs = await BlogRepo.findAllPublishedForWriter(req.user);
    return new SuccessResponse('success', blogs).send(reply);
  });

  fastify.get('/drafts/all', async (req: any, reply) => {
    const blogs = await BlogRepo.findAllDraftsForWriter(req.user);
    return new SuccessResponse('success', blogs).send(reply);
  });

  fastify.get(
    '/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const params = req.params as any;
      const blog = await BlogRepo.findBlogAllDataById(params.id);
      if (!blog) throw new BadRequestError('Blog does not exists');
      if (!isAuthor(blog, req.user)) {
        throw new ForbiddenError("You don't have necessary permissions");
      }
      return new SuccessResponse('success', blog).send(reply);
    },
  );
};

export default writerRoute;
