import prisma from '../index';
import Blog from '../model/Blog';
import User from '../model/User';

const AUTHOR_DETAIL = {
  select: {
    id: true,
    name: true,
    profilePicUrl: true,
  },
};

function formatUser(u: any) {
  if (!u) return undefined;
  return {
    ...u,
    _id: u.id,
  };
}

function formatBlog(blog: any): Blog | null {
  if (!blog) return null;
  return {
    ...blog,
    _id: blog.id,
    author: formatUser(blog.author),
    createdBy: formatUser(blog.createdBy),
    updatedBy: formatUser(blog.updatedBy),
  };
}

function formatBlogs(blogs: any[]): Blog[] {
  return blogs.map((b) => formatBlog(b)!);
}

function getUserId(user: User): string {
  return user.id || user._id || '';
}

async function create(blog: Blog): Promise<Blog> {
  const authorId = blog.authorId || (blog.author ? getUserId(blog.author) : '');
  const createdById =
    blog.createdById ||
    (blog.createdBy ? getUserId(blog.createdBy) : authorId);
  const updatedById =
    blog.updatedById ||
    (blog.updatedBy ? getUserId(blog.updatedBy) : authorId);

  const createdBlog = await prisma.blog.create({
    data: {
      title: blog.title,
      description: blog.description,
      text: blog.text ?? null,
      draftText: blog.draftText || '',
      tags: blog.tags || [],
      authorId: authorId,
      imgUrl: blog.imgUrl ?? null,
      blogUrl: blog.blogUrl,
      score: blog.score ?? 0.01,
      likes: blog.likes ?? 0,
      isSubmitted: blog.isSubmitted ?? false,
      isDraft: blog.isDraft ?? true,
      isPublished: blog.isPublished ?? false,
      status: blog.status ?? true,
      createdById: createdById,
      updatedById: updatedById,
    },
    include: {
      author: AUTHOR_DETAIL,
    },
  });

  return formatBlog(createdBlog)!;
}

async function update(blog: Blog): Promise<Blog | null> {
  const blogId = blog.id || blog._id || '';
  const data: any = {};
  if (blog.title !== undefined) data.title = blog.title;
  if (blog.description !== undefined) data.description = blog.description;
  if (blog.text !== undefined) data.text = blog.text;
  if (blog.draftText !== undefined) data.draftText = blog.draftText;
  if (blog.tags !== undefined) data.tags = blog.tags;
  if (blog.imgUrl !== undefined) data.imgUrl = blog.imgUrl;
  if (blog.blogUrl !== undefined) data.blogUrl = blog.blogUrl;
  if (blog.likes !== undefined) data.likes = blog.likes;
  if (blog.score !== undefined) data.score = blog.score;
  if (blog.isSubmitted !== undefined) data.isSubmitted = blog.isSubmitted;
  if (blog.isDraft !== undefined) data.isDraft = blog.isDraft;
  if (blog.isPublished !== undefined) data.isPublished = blog.isPublished;
  if (blog.publishedAt !== undefined) data.publishedAt = blog.publishedAt;
  if (blog.status !== undefined) data.status = blog.status;
  if (blog.updatedById !== undefined) data.updatedById = blog.updatedById;
  else if (blog.updatedBy !== undefined)
    data.updatedById = getUserId(blog.updatedBy);

  const updatedBlog = await prisma.blog.update({
    where: { id: blogId },
    data,
    include: {
      author: AUTHOR_DETAIL,
      createdBy: AUTHOR_DETAIL,
      updatedBy: AUTHOR_DETAIL,
    },
  });

  return formatBlog(updatedBlog);
}

async function findInfoById(id: string): Promise<Blog | null> {
  const blog = await prisma.blog.findFirst({
    where: { id: id, status: true },
    include: {
      author: AUTHOR_DETAIL,
    },
  });
  return formatBlog(blog);
}

async function findInfoForPublishedById(id: string): Promise<Blog | null> {
  const blog = await prisma.blog.findFirst({
    where: { id: id, isPublished: true, status: true },
    include: {
      author: AUTHOR_DETAIL,
    },
  });
  return formatBlog(blog);
}

async function findBlogAllDataById(id: string): Promise<Blog | null> {
  const blog = await prisma.blog.findFirst({
    where: { id: id, status: true },
    include: {
      author: AUTHOR_DETAIL,
      createdBy: AUTHOR_DETAIL,
      updatedBy: AUTHOR_DETAIL,
    },
  });
  return formatBlog(blog);
}

async function findPublishedByUrl(blogUrl: string): Promise<Blog | null> {
  const blog = await prisma.blog.findFirst({
    where: { blogUrl: blogUrl, isPublished: true, status: true },
    include: {
      author: AUTHOR_DETAIL,
    },
  });
  return formatBlog(blog);
}

async function findUrlIfExists(blogUrl: string): Promise<Blog | null> {
  const blog = await prisma.blog.findFirst({
    where: { blogUrl: blogUrl },
  });
  return formatBlog(blog);
}

async function findByTagAndPaginated(
  tag: string,
  pageNumber: number,
  limit: number,
): Promise<Blog[]> {
  const blogs = await prisma.blog.findMany({
    where: {
      tags: { has: tag },
      status: true,
      isPublished: true,
    },
    skip: limit * (pageNumber - 1),
    take: limit,
    orderBy: { updatedAt: 'desc' },
    include: {
      author: AUTHOR_DETAIL,
    },
  });
  return formatBlogs(blogs);
}

async function findAllPublishedForAuthor(user: User): Promise<Blog[]> {
  const userId = getUserId(user);
  const blogs = await prisma.blog.findMany({
    where: {
      authorId: userId,
      status: true,
      isPublished: true,
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      author: AUTHOR_DETAIL,
    },
  });
  return formatBlogs(blogs);
}

async function findDetailedBlogs(query: any): Promise<Blog[]> {
  const blogs = await prisma.blog.findMany({
    where: query,
    include: {
      author: AUTHOR_DETAIL,
      createdBy: AUTHOR_DETAIL,
      updatedBy: AUTHOR_DETAIL,
    },
    orderBy: { updatedAt: 'desc' },
  });
  return formatBlogs(blogs);
}

async function findAllDrafts(): Promise<Blog[]> {
  return findDetailedBlogs({ isDraft: true, status: true });
}

async function findAllSubmissions(): Promise<Blog[]> {
  return findDetailedBlogs({ isSubmitted: true, status: true });
}

async function findAllPublished(): Promise<Blog[]> {
  return findDetailedBlogs({ isPublished: true, status: true });
}

async function findAllSubmissionsForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({
    authorId: getUserId(user),
    status: true,
    isSubmitted: true,
  });
}

async function findAllPublishedForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({
    authorId: getUserId(user),
    status: true,
    isPublished: true,
  });
}

async function findAllDraftsForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({
    authorId: getUserId(user),
    status: true,
    isDraft: true,
  });
}

async function findLatestBlogs(
  pageNumber: number,
  limit: number,
): Promise<Blog[]> {
  const blogs = await prisma.blog.findMany({
    where: { status: true, isPublished: true },
    skip: limit * (pageNumber - 1),
    take: limit,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: AUTHOR_DETAIL,
    },
  });
  return formatBlogs(blogs);
}

async function searchSimilarBlogs(blog: Blog, limit: number): Promise<Blog[]> {
  const blogId = blog.id || blog._id || '';
  const blogs = await prisma.blog.findMany({
    where: {
      id: { not: blogId },
      status: true,
      isPublished: true,
      OR: [
        { title: { contains: blog.title, mode: 'insensitive' } },
        { tags: { hasSome: blog.tags || [] } },
      ],
    },
    take: limit,
    orderBy: { updatedAt: 'desc' },
    include: {
      author: AUTHOR_DETAIL,
    },
  });
  return formatBlogs(blogs);
}

async function search(query: string, limit: number): Promise<Blog[]> {
  const blogs = await prisma.blog.findMany({
    where: {
      status: true,
      isPublished: true,
      title: { contains: query, mode: 'insensitive' },
    },
    take: limit,
    orderBy: { score: 'desc' },
  });
  return formatBlogs(blogs);
}

async function searchLike(query: string, limit: number): Promise<Blog[]> {
  const blogs = await prisma.blog.findMany({
    where: {
      status: true,
      isPublished: true,
      title: { contains: query, mode: 'insensitive' },
    },
    take: limit,
    orderBy: { score: 'desc' },
  });
  return formatBlogs(blogs);
}

export default {
  create,
  update,
  findInfoById,
  findInfoForPublishedById,
  findBlogAllDataById,
  findPublishedByUrl,
  findUrlIfExists,
  findByTagAndPaginated,
  findAllPublishedForAuthor,
  findAllDrafts,
  findAllSubmissions,
  findAllPublished,
  findAllSubmissionsForWriter,
  findAllPublishedForWriter,
  findAllDraftsForWriter,
  findLatestBlogs,
  searchSimilarBlogs,
  search,
  searchLike,
};
