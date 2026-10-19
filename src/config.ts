// Mapper for environment variables
export const environment = process.env.NODE_ENV || 'development';
export const port = process.env.PORT || '3000';
export const timezone = process.env.TZ || 'UTC';

export const db = {
  name: process.env.DB_NAME || 'blogs-db',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  user: process.env.DB_USER || 'blogs-db-user',
  password: process.env.DB_USER_PWD || 'changeit',
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5', 10),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
  url:
    process.env.DATABASE_URL ||
    'postgresql://blogs-db-user:changeit@localhost:5432/blogs-db?schema=public',
};

export const corsUrl = process.env.CORS_URL || '*';

export const tokenInfo = {
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || '172800', 10),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || '604800', 10),
  issuer: process.env.TOKEN_ISSUER || 'api.dev.xyz.com',
  audience: process.env.TOKEN_AUDIENCE || 'xyz.com',
};

export const logDirectory = process.env.LOG_DIR;

export const redis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || 'changeit',
};

export const caching = {
  contentCacheDuration: parseInt(
    process.env.CONTENT_CACHE_DURATION_MILLIS || '600000',
    10,
  ),
};
