import Role from './Role';

export default interface User {
  id: string;
  _id?: string;
  name?: string | null;
  profilePicUrl?: string | null;
  email?: string | null;
  password?: string | null;
  roles?: Role[];
  verified?: boolean;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
