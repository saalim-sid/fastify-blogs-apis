import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';
import { BadRequestError } from '../core/ApiError';

export enum ValidationSource {
  BODY = 'body',
  HEADER = 'headers',
  QUERY = 'query',
  PARAM = 'params',
}

/** Validates an ID string */
export const zObjectId = () =>
  z.string().min(1, 'invalid id');

/** Validates an "Authorization: Bearer <token>" header value */
export const zAuthBearer = () =>
  z.string().regex(/^Bearer\s.+$/, 'invalid bearer token');

export const zUrlEndpoint = (maxLength?: number) => {
  const base = maxLength !== undefined ? z.string().max(maxLength) : z.string();
  return base.refine((value) => !value.includes('://'), 'invalid url endpoint');
};

/**
 * Validates request data against a Zod schema for Fastify preHandler hook
 *
 * @param schema  Any z.ZodType (z.object, z.string, etc.)
 * @param source  Part of the request to validate (default: 'body')
 */
export default (
  schema: z.ZodType,
  source: ValidationSource = ValidationSource.BODY,
) =>
  async (req: FastifyRequest, _reply?: FastifyReply): Promise<void> => {
    const dataToValidate = req[source as keyof FastifyRequest];
    const result = schema.safeParse(dataToValidate);

    if (result.success) {
      if (
        source === ValidationSource.BODY ||
        source === ValidationSource.QUERY ||
        source === ValidationSource.PARAM
      ) {
        (req as any)[source] = result.data;
      }
      return;
    }

    const message = result.error.issues
      .map((issue) => {
        const field = issue.path?.at(-1);
        return field ? `${String(field)}: ${issue.message}` : issue.message;
      })
      .join(', ');

    throw new BadRequestError(message);
  };
