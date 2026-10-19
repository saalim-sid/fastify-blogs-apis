export enum RoleCode {
  LEARNER = 'LEARNER',
  WRITER = 'WRITER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
}

export default interface Role {
  id: string;
  _id?: string;
  code: string;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
