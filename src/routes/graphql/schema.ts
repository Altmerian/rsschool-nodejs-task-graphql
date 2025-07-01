import { GraphQLSchema } from 'graphql';
import { RootQueryType, MutationsType } from './types/root.js';

export const graphQLSchema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationsType,
});