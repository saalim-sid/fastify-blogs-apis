import z from 'zod';
import { zAuthBearer } from '../../helpers/validator';

export default {
  credential: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  refreshToken: z.object({
    refreshToken: z.string().min(1),
  }),
  auth: z
    .object({
      authorization: zAuthBearer(),
    })
    .passthrough(),
  signup: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    profilePicUrl: z.string().url().optional(),
  }),
};
