import { GraphQLResolveInfo, FieldNode, SelectionNode, Kind } from 'graphql';
import { GraphQLContext, UserWithSubscriptions, User as UserModel } from '../types/graphql-types.js';

/**
 * Helper function to extract requested field names from GraphQL selection set
 */
function getRequestedFields(info: GraphQLResolveInfo): Set<string> {
  const requestedFields = new Set<string>();

  function extractFields(selections: readonly SelectionNode[]): void {
    for (const selection of selections) {
      if (selection.kind === Kind.FIELD) {
        const fieldNode = selection as FieldNode;
        requestedFields.add(fieldNode.name.value);

        if (fieldNode.selectionSet) {
          extractFields(fieldNode.selectionSet.selections);
        }
      }
    }
  }

  if (info.fieldNodes[0]?.selectionSet) {
    extractFields(info.fieldNodes[0].selectionSet.selections);
  }

  return requestedFields;
}

/**
 * Optimized user query that conditionally includes subscription relations
 * and primes DataLoaders based on GraphQL query analysis
 */
export async function getOptimizedUsers(
  context: GraphQLContext,
  info: GraphQLResolveInfo
): Promise<UserModel[]> {
  // Parse the GraphQL query to determine which fields are requested
  const requestedFields = getRequestedFields(info);
  console.log('DEBUG: Requested fields:', Array.from(requestedFields));

  const needsUserSubscribedTo = requestedFields.has('userSubscribedTo');
  const needsSubscribedToUser = requestedFields.has('subscribedToUser');

  console.log('DEBUG: needsUserSubscribedTo:', needsUserSubscribedTo, 'needsSubscribedToUser:', needsSubscribedToUser);

  if (needsUserSubscribedTo || needsSubscribedToUser) {
    // If subscription fields are requested, include them in the query
    const include: Record<string, unknown> = {};
    if (needsUserSubscribedTo) {
      include.userSubscribedTo = { include: { author: true } };
    }
    if (needsSubscribedToUser) {
      include.subscribedToUser = { include: { subscriber: true } };
    }

    console.log('DEBUG: Prisma include:', JSON.stringify(include, null, 2));

    const usersWithSubscriptions = await context.prisma.user.findMany({
      include,
    }) as UserWithSubscriptions[];

    // Prime the DataLoaders with the fetched subscription data
    usersWithSubscriptions.forEach((user) => {
      if (user.userSubscribedTo && needsUserSubscribedTo) {
        const authors = user.userSubscribedTo.map((sub: { author: UserModel }) => sub.author);
        context.loaders.userSubscribedToLoader.prime(user.id, authors);
      }
      if (user.subscribedToUser && needsSubscribedToUser) {
        const subscribers = user.subscribedToUser.map((sub: { subscriber: UserModel }) => sub.subscriber);
        context.loaders.subscribedToUserLoader.prime(user.id, subscribers);
      }
    });

    return usersWithSubscriptions;
  }

  // If no subscription fields are requested, use simple query
  return context.prisma.user.findMany();
}

/**
 * Optimized single user query that conditionally includes subscription relations
 * and primes DataLoaders based on GraphQL query analysis
 */
export async function getOptimizedUser(
  userId: string,
  context: GraphQLContext,
  info: GraphQLResolveInfo
): Promise<UserModel | null> {
  // Parse the GraphQL query to determine which fields are requested
  const requestedFields = getRequestedFields(info);
  const needsUserSubscribedTo = requestedFields.has('userSubscribedTo');
  const needsSubscribedToUser = requestedFields.has('subscribedToUser');

  if (needsUserSubscribedTo || needsSubscribedToUser) {
    // If subscription fields are requested, include them in the query
    const include: Record<string, unknown> = {};
    if (needsUserSubscribedTo) {
      include.userSubscribedTo = { include: { author: true } };
    }
    if (needsSubscribedToUser) {
      include.subscribedToUser = { include: { subscriber: true } };
    }

    const userWithSubscriptions = await context.prisma.user.findUnique({
      where: { id: userId },
      include,
    }) as UserWithSubscriptions | null;

    // Prime the DataLoaders with the fetched subscription data
    if (userWithSubscriptions) {
      if (userWithSubscriptions.userSubscribedTo && needsUserSubscribedTo) {
        const authors = userWithSubscriptions.userSubscribedTo.map((sub: { author: UserModel }) => sub.author);
        context.loaders.userSubscribedToLoader.prime(userWithSubscriptions.id, authors);
      }
      if (userWithSubscriptions.subscribedToUser && needsSubscribedToUser) {
        const subscribers = userWithSubscriptions.subscribedToUser.map((sub: { subscriber: UserModel }) => sub.subscriber);
        context.loaders.subscribedToUserLoader.prime(userWithSubscriptions.id, subscribers);
      }
    }

    return userWithSubscriptions;
  }

  // If no subscription fields are requested, use simple query
  return context.prisma.user.findUnique({
    where: { id: userId },
  });
}
