import z from 'zod';
import { zObjectId, zUrlEndpoint } from '../../helpers/validator';

export default {
  blogUrl: z.object({
    endpoint: zUrlEndpoint(200),
  }),
  blogId: z.object({
    id: zObjectId(),
  }),
  blogCreate: z.object({
    title: z.string().min(3).max(500),
    description: z.string().min(3).max(2000),
    text: z.string().max(50000),
    blogUrl: zUrlEndpoint(200),
    imgUrl: z.string().url().max(200).optional(),
    score: z.number().min(0).max(1).optional(),
    tags: z.array(z.string().toUpperCase()).min(1).optional(),
  }),
  blogUpdate: z.object({
    title: z.string().min(3).max(500).optional(),
    description: z.string().min(3).max(2000).optional(),
    text: z.string().max(50000).optional(),
    blogUrl: zUrlEndpoint(200).optional(),
    imgUrl: z.string().url().max(200).optional(),
    score: z.number().min(0).max(1).optional(),
    tags: z.array(z.string().toUpperCase()).min(1).optional(),
  }),
};
