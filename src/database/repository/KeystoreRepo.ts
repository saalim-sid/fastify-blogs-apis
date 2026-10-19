import prisma from '../index';
import Keystore from '../model/Keystore';
import User from '../model/User';

function getUserId(client: User): string {
  return client.id || client._id || '';
}

async function findforKey(client: User, key: string): Promise<Keystore | null> {
  const userId = getUserId(client);
  const keystore = await prisma.keystore.findFirst({
    where: {
      userId: userId,
      primaryKey: key,
      status: true,
    },
  });
  if (!keystore) return null;
  return {
    ...keystore,
    _id: keystore.id,
    client: client,
  };
}

async function remove(id: string): Promise<Keystore | null> {
  try {
    const keystore = await prisma.keystore.delete({
      where: { id },
    });
    return {
      ...keystore,
      _id: keystore.id,
    };
  } catch {
    return null;
  }
}

async function removeAllForClient(client: User) {
  const userId = getUserId(client);
  return prisma.keystore.deleteMany({
    where: { userId: userId },
  });
}

async function find(
  client: User,
  primaryKey: string,
  secondaryKey: string,
): Promise<Keystore | null> {
  const userId = getUserId(client);
  const keystore = await prisma.keystore.findFirst({
    where: {
      userId: userId,
      primaryKey: primaryKey,
      secondaryKey: secondaryKey,
    },
  });
  if (!keystore) return null;
  return {
    ...keystore,
    _id: keystore.id,
    client: client,
  };
}

async function create(
  client: User,
  primaryKey: string,
  secondaryKey: string,
): Promise<Keystore> {
  const userId = getUserId(client);
  const keystore = await prisma.keystore.create({
    data: {
      userId: userId,
      primaryKey: primaryKey,
      secondaryKey: secondaryKey,
    },
  });
  return {
    ...keystore,
    _id: keystore.id,
    client: client,
  };
}

export default {
  findforKey,
  remove,
  removeAllForClient,
  find,
  create,
};
