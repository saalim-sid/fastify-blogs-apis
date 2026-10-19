import { PrismaClient } from '@prisma/client';
import Logger from '../core/Logger';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

// @ts-ignore
prisma.$on('error', (e: any) => {
  Logger.error(`Prisma error: ${e.message}`);
});

// @ts-ignore
prisma.$on('warn', (e: any) => {
  Logger.warn(`Prisma warning: ${e.message}`);
});

// @ts-ignore
prisma.$on('info', (e: any) => {
  Logger.info(`Prisma info: ${e.message}`);
});

prisma
  .$connect()
  .then(() => {
    Logger.info('Prisma database connection established');
  })
  .catch((e) => {
    Logger.error('Prisma connection error: ' + e);
  });

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  Logger.info('Prisma connection closed through app termination');
  process.exit(0);
});

export default prisma;
