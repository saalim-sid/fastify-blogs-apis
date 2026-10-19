import { FastifyPluginAsync } from 'fastify';
import health from './health';
import apikey from '../auth/apikey';
import permission from '../helpers/permission';
import { Permission } from '../database/model/ApiKey';
import signup from './access/signup';
import login from './access/login';
import logout from './access/logout';
import token from './access/token';
import credential from './access/credential';
import blog from './blog';
import blogs from './blogs';
import profile from './profile';

const routes: FastifyPluginAsync = async (fastify) => {
  /*---------------------------------------------------------*/
  fastify.register(health, { prefix: '/health' });
  /*---------------------------------------------------------*/

  /*---------------------------------------------------------*/
  // Encapsulated routes requiring API key & GENERAL permission
  /*---------------------------------------------------------*/
  fastify.register(async (api) => {
    api.addHook('preHandler', apikey);
    api.addHook('preHandler', permission(Permission.GENERAL));

    api.register(signup, { prefix: '/signup' });
    api.register(login, { prefix: '/login' });
    api.register(logout, { prefix: '/logout' });
    api.register(token, { prefix: '/token' });
    api.register(credential, { prefix: '/credential' });
    api.register(profile, { prefix: '/profile' });
    api.register(blog, { prefix: '/blog' });
    api.register(blogs, { prefix: '/blogs' });
  });
};

export default routes;
