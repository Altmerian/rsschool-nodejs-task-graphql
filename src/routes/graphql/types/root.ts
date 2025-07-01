import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLResolveInfo } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberTypeIdEnum } from './enums.js';
import { MemberType, UserType, PostType, ProfileType } from './objects.js';
import { getOptimizedUsers, getOptimizedUser } from '../utils/queryOptimizer.js';
import {
  CreateUserInput,
  CreateProfileInput,
  CreatePostInput,
  ChangeUserInput,
  ChangeProfileInput,
  ChangePostInput,
} from './inputs.js';
import {
  GraphQLContext,
  MemberType as MemberTypeModel,
  User as UserModel,
  Post as PostModel,
  Profile as ProfileModel,
  IdArgs,
  CreateUserArgs,
  CreateProfileArgs,
  CreatePostArgs,
  ChangeUserArgs,
  ChangeProfileArgs,
  ChangePostArgs,
  DeleteArgs,
  SubscriptionArgs,
} from './graphql-types.js';

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  description: 'The root query type',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<MemberTypeModel[]> => {
        return context.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      resolve: async (_parent: unknown, args: IdArgs, context: GraphQLContext): Promise<MemberTypeModel | null> => {
        return context.prisma.memberType.findUnique({
          where: { id: args.id },
        });
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (_parent: unknown, _args: unknown, context: GraphQLContext, info: GraphQLResolveInfo): Promise<UserModel[]> => {
        return getOptimizedUsers(context, info);
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent: unknown, args: IdArgs, context: GraphQLContext, info: GraphQLResolveInfo): Promise<UserModel | null> => {
        return getOptimizedUser(args.id, context, info);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<PostModel[]> => {
        return context.prisma.post.findMany();
      },
    },
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent: unknown, args: IdArgs, context: GraphQLContext): Promise<PostModel | null> => {
        return context.prisma.post.findUnique({
          where: { id: args.id },
        });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
      resolve: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<ProfileModel[]> => {
        return context.prisma.profile.findMany();
      },
    },
    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent: unknown, args: IdArgs, context: GraphQLContext): Promise<ProfileModel | null> => {
        return context.prisma.profile.findUnique({
          where: { id: args.id },
        });
      },
    },
  },
});

export const MutationsType = new GraphQLObjectType({
  name: 'Mutations',
  description: 'The root mutation type',
  fields: {
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (_parent: unknown, args: CreateUserArgs, context: GraphQLContext): Promise<UserModel> => {
        return context.prisma.user.create({
          data: args.dto,
        });
      },
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: async (_parent: unknown, args: CreateProfileArgs, context: GraphQLContext): Promise<ProfileModel> => {
        return context.prisma.profile.create({
          data: args.dto,
        });
      },
    },
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: async (_parent: unknown, args: CreatePostArgs, context: GraphQLContext): Promise<PostModel> => {
        return context.prisma.post.create({
          data: args.dto,
        });
      },
    },
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_parent: unknown, args: ChangeUserArgs, context: GraphQLContext): Promise<UserModel> => {
        return context.prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_parent: unknown, args: ChangeProfileArgs, context: GraphQLContext): Promise<ProfileModel> => {
        return context.prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
    changePost: {
      type: new GraphQLNonNull(PostType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_parent: unknown, args: ChangePostArgs, context: GraphQLContext): Promise<PostModel> => {
        return context.prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent: unknown, args: DeleteArgs, context: GraphQLContext): Promise<string> => {
        await context.prisma.user.delete({
          where: { id: args.id },
        });
        return args.id;
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent: unknown, args: DeleteArgs, context: GraphQLContext): Promise<string> => {
        await context.prisma.post.delete({
          where: { id: args.id },
        });
        return args.id;
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent: unknown, args: DeleteArgs, context: GraphQLContext): Promise<string> => {
        await context.prisma.profile.delete({
          where: { id: args.id },
        });
        return args.id;
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent: unknown, args: SubscriptionArgs, context: GraphQLContext): Promise<string> => {
        await context.prisma.user.update({
          where: { id: args.userId },
          data: {
            userSubscribedTo: {
              create: {
                authorId: args.authorId,
              },
            },
          },
        });
        return `User ${args.userId} subscribed to ${args.authorId}`;
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent: unknown, args: SubscriptionArgs, context: GraphQLContext): Promise<string> => {
        await context.prisma.user.update({
          where: { id: args.userId },
          data: {
            userSubscribedTo: {
              delete: {
                subscriberId_authorId: {
                  subscriberId: args.userId,
                  authorId: args.authorId,
                },
              },
            },
          },
        });
        return `User ${args.userId} unsubscribed from ${args.authorId}`;
      },
    },
  },
});
