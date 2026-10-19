import prisma from '../index';
import Role from '../model/Role';

async function findByCode(code: string): Promise<Role | null> {
  const role = await prisma.role.findFirst({
    where: { code: code, status: true },
  });
  if (!role) return null;
  return {
    ...role,
    _id: role.id,
  };
}

async function findByCodes(codes: string[]): Promise<Role[]> {
  const roles = await prisma.role.findMany({
    where: { code: { in: codes }, status: true },
  });
  return roles.map((r) => ({
    ...r,
    _id: r.id,
  }));
}

export default {
  findByCode,
  findByCodes,
};
