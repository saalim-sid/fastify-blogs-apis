import { FastifyPluginAsync } from 'fastify';
import { SuccessResponse } from '../../core/ApiResponse';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import { BadRequestError } from '../../core/ApiError';
import BlogRepo from '../../database/repository/BlogRepo';
import User from '../../database/model/User';
import BlogsCache from '../../cache/repository/BlogsCache';

const blogsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/tag/:tag',
    {
      preHandler: [
        validator(schema.blogTag, ValidationSource.PARAM),
        validator(schema.pagination, ValidationSource.QUERY),
      ],
    },
    async (req: any, reply) => {
      const blogs = await BlogRepo.findByTagAndPaginated(
        req.params.tag as string,
        parseInt(req.query.pageNumber as string, 10),
        parseInt(req.query.pageItemCount as string, 10),
      );
      return new SuccessResponse('success', blogs).send(reply);
    },
  );

  fastify.get(
    '/author/id/:id',
    { preHandler: [validator(schema.authorId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const blogs = await BlogRepo.findAllPublishedForAuthor({
        id: req.params.id as string,
        _id: req.params.id as string,
      } as User);
      return new SuccessResponse('success', blogs).send(reply);
    },
  );

  fastify.get(
    '/latest',
    { preHandler: [validator(schema.pagination, ValidationSource.QUERY)] },
    async (req: any, reply) => {
      const blogs = await BlogRepo.findLatestBlogs(
        parseInt(req.query.pageNumber as string, 10),
        parseInt(req.query.pageItemCount as string, 10),
      );
      return new SuccessResponse('success', blogs).send(reply);
    },
  );

  fastify.get(
    '/similar/id/:id',
    { preHandler: [validator(schema.blogId, ValidationSource.PARAM)] },
    async (req: any, reply) => {
      const blogId = req.params.id as string;
      let blogs = await BlogsCache.fetchSimilarBlogs(blogId);

      if (!blogs) {
        const blog = await BlogRepo.findInfoForPublishedById(blogId);
        if (!blog) throw new BadRequestError('Blog is not available');
        blogs = await BlogRepo.searchSimilarBlogs(blog, 6);

        if (blogs && blogs.length > 0) {
          await BlogsCache.saveSimilarBlogs(blogId, blogs);
        }
      }

      return new SuccessResponse('success', blogs ? blogs : []).send(reply);
    },
  );
};

export default blogsRoute;
