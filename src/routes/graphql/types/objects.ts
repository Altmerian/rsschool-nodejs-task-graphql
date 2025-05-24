import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLBoolean, GraphQLList, GraphQLNonNull } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberTypeIdEnum } from './enums.js';
import {
  GraphQLContext,
  Profile as ProfileModel,
  User as UserModel,
  Post as PostModel,
  MemberType as MemberTypeModel,
  UserWithSubscriptions
} from './graphql-types.js';

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  description: 'Represents a member type with specific privileges',
  fields: () => ({
    id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'Represents a post created by a user',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  description: 'Represents a user profile with additional information',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (parent: ProfileModel, _args: unknown, context: GraphQLContext): Promise<MemberTypeModel | null> => {
        return context.prisma.memberType.findUnique({
          where: { id: parent.memberTypeId },
        });
      },
    },
  }),
});

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  description: 'Represents a user in the system',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (parent: UserModel, _args: unknown, context: GraphQLContext): Promise<ProfileModel | null> => {
        return context.prisma.profile.findUnique({
          where: { userId: parent.id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: async (parent: UserModel, _args: unknown, context: GraphQLContext): Promise<PostModel[]> => {
        return context.prisma.post.findMany({
          where: { authorId: parent.id },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (parent: UserModel, _args: unknown, context: GraphQLContext): Promise<UserModel[]> => {
        const user = await context.prisma.user.findUnique({
          where: { id: parent.id },
          include: { userSubscribedTo: { include: { author: true } } },
        }) as UserWithSubscriptions | null;
        return user?.userSubscribedTo?.map((sub: { author: UserModel }) => sub.author) || [];
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (parent: UserModel, _args: unknown, context: GraphQLContext): Promise<UserModel[]> => {
        const user = await context.prisma.user.findUnique({
          where: { id: parent.id },
          include: { subscribedToUser: { include: { subscriber: true } } },
        }) as UserWithSubscriptions | null;
        return user?.subscribedToUser?.map((sub: { subscriber: UserModel }) => sub.subscriber) || [];
      },
    },
  }),
});