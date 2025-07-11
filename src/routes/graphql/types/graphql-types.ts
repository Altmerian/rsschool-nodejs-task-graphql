import { PrismaClient } from '@prisma/client';
import { DataLoaders } from '../dataLoaders.js';

export interface GraphQLContext {
  prisma: PrismaClient;
  loaders: DataLoaders;
}

export interface IdArgs {
  id: string;
}

export interface User {
  id: string;
  name: string;
  balance: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export interface Profile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

export interface MemberType {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}

export interface UserWithSubscriptions {
  id: string;
  name: string;
  balance: number;
  userSubscribedTo?: Array<{ author: User }>;
  subscribedToUser?: Array<{ subscriber: User }>;
}

// Mutation argument interfaces
export interface CreateUserArgs {
  dto: {
    name: string;
    balance: number;
  };
}

export interface CreateProfileArgs {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    userId: string;
    memberTypeId: string;
  };
}

export interface CreatePostArgs {
  dto: {
    title: string;
    content: string;
    authorId: string;
  };
}

export interface ChangeUserArgs {
  id: string;
  dto: {
    name?: string;
    balance?: number;
  };
}

export interface ChangeProfileArgs {
  id: string;
  dto: {
    isMale?: boolean;
    yearOfBirth?: number;
    memberTypeId?: string;
  };
}

export interface ChangePostArgs {
  id: string;
  dto: {
    title?: string;
    content?: string;
  };
}

export interface DeleteArgs {
  id: string;
}

export interface SubscriptionArgs {
  userId: string;
  authorId: string;
}
