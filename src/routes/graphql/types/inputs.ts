import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberTypeIdEnum } from './enums.js';

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  description: 'Input for creating a new user',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  description: 'Input for creating a new profile',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
  },
});

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  description: 'Input for creating a new post',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  description: 'Input for updating a user',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  description: 'Input for updating a profile',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdEnum },
  },
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  description: 'Input for updating a post',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});
