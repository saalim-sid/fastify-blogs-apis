import Logger from './core/Logger';
import { port } from './config';
import app from './app';

const serverPort = parseInt(port || '3000', 10);

app
  .listen({ port: serverPort, host: '0.0.0.0' })
  .then((address) => {
    Logger.info(`server running on ${address}`);
  })
  .catch((e) => {
    Logger.error(e);
    process.exit(1);
  });
