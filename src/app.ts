import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import Logger from './core/Logger';
import { corsUrl, environment } from './config';
import './database'; // initialize database
import './cache'; // initialize cache
import {
  NotFoundError,
  ApiError,
  InternalError,
  ErrorType,
} from './core/ApiError';
import routes from './routes';

process.on('uncaughtException', (e) => {
  Logger.error(e);
});

const app: FastifyInstance = Fastify({
  bodyLimit: 10 * 1024 * 1024, // 10mb
  logger: false,
});

// Middleware Plugins
app.register(cors, {
  origin: corsUrl === '*' ? true : corsUrl,
});
app.register(formbody);

// Register application routes
app.register(routes);

// Catch 404 and forward to error handler
app.setNotFoundHandler((_request, reply) => {
  ApiError.handle(new NotFoundError(), reply);
});

// Centralized Error Handler
app.setErrorHandler((error: any, request, reply) => {
  if (error instanceof ApiError) {
    ApiError.handle(error, reply);
    if (error.type === ErrorType.INTERNAL) {
      Logger.error(
        `500 - ${error.message} - ${request.url} - ${request.method} - ${request.ip}`,
      );
    }
  } else {
    Logger.error(
      `500 - ${error.message} - ${request.url} - ${request.method} - ${request.ip}`,
    );
    Logger.error(error);
    if (environment === 'development') {
      reply.status(500).send({
        statusCode: '10001',
        message: error.message || 'Internal Error',
        stack: error.stack,
      });
      return;
    }
    ApiError.handle(new InternalError(), reply);
  }
});

export default app;
