import z from 'zod';
import { zObjectId } from '../../helpers/validator';

export default {
  userId: z.object({
    id: zObjectId(),
  }),
  profile: z.object({
    name: z.string().min(1).max(200).optional(),
    profilePicUrl: z.string().url().optional(),
  }),
};
