import { ProtectedRequest } from '../types/app-request';
import { AuthFailureError } from '../core/ApiError';
import RoleRepo from '../database/repository/RoleRepo';
import { FastifyReply } from 'fastify';

export default async (
  req: ProtectedRequest,
  _reply?: FastifyReply,
): Promise<void> => {
  if (!req.user || !req.user.roles || !req.currentRoleCodes) {
    throw new AuthFailureError('Permission denied');
  }

  const roles = await RoleRepo.findByCodes(req.currentRoleCodes);
  if (roles.length === 0) {
    throw new AuthFailureError('Permission denied');
  }

  let authorized = false;

  for (const userRole of req.user.roles) {
    if (authorized) break;
    const userRoleId = userRole.id || userRole._id;
    for (const role of roles) {
      const roleId = role.id || role._id;
      if (userRoleId === roleId) {
        authorized = true;
        break;
      }
    }
  }

  if (!authorized) {
    throw new AuthFailureError('Permission denied');
  }
};
