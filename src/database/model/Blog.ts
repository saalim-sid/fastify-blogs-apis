import User from './User';

export default interface Blog {
  id: string;
  _id?: string;
  title: string;
  description: string;
  text?: string | null;
  draftText?: string;
  tags: string[];
  authorId?: string;
  author?: User;
  imgUrl?: string | null;
  blogUrl: string;
  likes?: number;
  score?: number;
  isSubmitted?: boolean;
  isDraft?: boolean;
  isPublished?: boolean;
  status?: boolean;
  publishedAt?: Date | null;
  createdById?: string;
  createdBy?: User;
  updatedById?: string;
  updatedBy?: User;
  createdAt?: Date;
  updatedAt?: Date;
}
