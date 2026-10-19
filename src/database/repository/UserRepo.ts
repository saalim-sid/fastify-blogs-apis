import prisma from '../index';
import User from '../model/User';
import { InternalError } from '../../core/ApiError';
import KeystoreRepo from './KeystoreRepo';
import Keystore from '../model/Keystore';

function formatUser(user: any): User | null {
  if (!user) return null;
  return {
    ...user,
    _id: user.id,
    roles: user.roles?.map((r: any) => ({
      ...r,
      _id: r.id,
    })),
  };
}

async function exists(id: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: { id: id, status: true },
  });
  return count > 0;
}

async function findPrivateProfileById(id: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { id: id, status: true },
    include: {
      roles: {
        where: { status: true },
      },
    },
  });
  return formatUser(user);
}

// contains critical information of the user
async function findById(id: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { id: id, status: true },
    include: {
      roles: {
        where: { status: true },
      },
    },
  });
  return formatUser(user);
}

async function findByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { email: email },
    include: {
      roles: {
        where: { status: true },
      },
    },
  });
  return formatUser(user);
}

async function findFieldsById(
  id: string,
  ...fields: string[]
): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { id: id, status: true },
  });
  return formatUser(user);
}

async function findPublicProfileById(id: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: { id: id, status: true },
  });
  return formatUser(user);
}

async function create(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
  roleCode: string,
): Promise<{ user: User; keystore: Keystore }> {
  const role = await prisma.role.findFirst({
    where: { code: roleCode, status: true },
  });
  if (!role) throw new InternalError('Role must be defined');

  const createdUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      profilePicUrl: user.profilePicUrl,
      password: user.password,
      status: true,
      verified: user.verified ?? false,
      roles: {
        connect: [{ id: role.id }],
      },
    },
    include: {
      roles: true,
    },
  });

  const formattedUser = formatUser(createdUser)!;

  const keystore = await KeystoreRepo.create(
    formattedUser,
    accessTokenKey,
    refreshTokenKey,
  );

  return {
    user: formattedUser,
    keystore: keystore,
  };
}

async function update(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
): Promise<{ user: User; keystore: Keystore }> {
  const userId = user.id || user._id || '';
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: user.name,
      profilePicUrl: user.profilePicUrl,
      email: user.email ?? undefined,
      password: user.password ?? undefined,
      status: user.status ?? undefined,
      verified: user.verified ?? undefined,
    },
    include: {
      roles: true,
    },
  });

  const formattedUser = formatUser(updatedUser)!;
  const keystore = await KeystoreRepo.create(
    formattedUser,
    accessTokenKey,
    refreshTokenKey,
  );
  return { user: formattedUser, keystore: keystore };
}

async function updateInfo(user: Partial<User>): Promise<any> {
  const userId = user.id || user._id || '';
  const data: any = {};
  if (user.name !== undefined) data.name = user.name;
  if (user.profilePicUrl !== undefined) data.profilePicUrl = user.profilePicUrl;
  if (user.email !== undefined) data.email = user.email;
  if (user.password !== undefined) data.password = user.password;
  if (user.status !== undefined) data.status = user.status;
  if (user.verified !== undefined) data.verified = user.verified;

  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export default {
  exists,
  findPrivateProfileById,
  findById,
  findByEmail,
  findFieldsById,
  findPublicProfileById,
  create,
  update,
  updateInfo,
};
