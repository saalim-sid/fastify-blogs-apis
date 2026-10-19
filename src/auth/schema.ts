import z from 'zod';
import { Header } from '../core/utils';
import { zAuthBearer } from '../helpers/validator';

export default {
  apiKey: z
    .object({
      [Header.API_KEY]: z.string().min(1),
    })
    .passthrough(),
  auth: z
    .object({
      authorization: zAuthBearer(),
    })
    .passthrough(),
};
