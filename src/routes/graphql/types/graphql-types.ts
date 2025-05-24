import { PrismaClient } from '@prisma/client';

export interface GraphQLContext {
  prisma: PrismaClient;
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
