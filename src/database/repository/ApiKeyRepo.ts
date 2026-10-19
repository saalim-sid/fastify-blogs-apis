import prisma from '../index';
import ApiKey from '../model/ApiKey';

async function findByKey(key: string): Promise<ApiKey | null> {
  const apiKey = await prisma.apiKey.findFirst({
    where: { key: key, status: true },
  });
  if (!apiKey) return null;
  return {
    ...apiKey,
    _id: apiKey.id,
  };
}

export default {
  findByKey,
};
