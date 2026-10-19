export enum Permission {
  GENERAL = 'GENERAL',
}

export default interface ApiKey {
  id: string;
  _id?: string;
  key: string;
  version: number;
  permissions: Permission[] | string[];
  comments: string[];
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
