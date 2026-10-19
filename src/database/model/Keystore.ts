import User from './User';

export default interface Keystore {
  id: string;
  _id?: string;
  userId: string;
  client?: User;
  primaryKey: string;
  secondaryKey: string;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
