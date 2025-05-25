import { GraphQLResolveInfo, FieldNode, SelectionNode, Kind } from 'graphql';
import { GraphQLContext, UserWithSubscriptions, User as UserModel } from '../types/graphql-types.js';

// Type for raw SubscribersOnAuthors junction table records (simple boolean includes)
interface SubscribersOnAuthorsRecord {
  authorId: string;
  subscriberId: string;
}

// Type for complex includes with nested User objects
interface SubscriptionWithUser {
  author?: UserModel;
  subscriber?: UserModel;
}

// Union type to handle both formats
type SubscriptionRecord = SubscribersOnAuthorsRecord | SubscriptionWithUser;

/**
 * Helper function to extract requested field names from GraphQL selection set
 */
function getRequestedFields(info: GraphQLResolveInfo): Set<string> {
  const requestedFields = new Set<string>();

  function extractFields(selections: readonly SelectionNode[]): void {
    for (const selection of selections) {
      if (selection.kind === Kind.FIELD) {
        const fieldNode = selection;
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
  const requestedFields = getRequestedFields(info);

  const needsUserSubscribedTo = requestedFields.has('userSubscribedTo');
  const needsSubscribedToUser = requestedFields.has('subscribedToUser');


  if (needsUserSubscribedTo || needsSubscribedToUser) {
    const include: Record<string, boolean> = {};
    if (needsUserSubscribedTo) {
      include.userSubscribedTo = true;
    }
    if (needsSubscribedToUser) {
      include.subscribedToUser = true;
    }


    const usersWithSubscriptions = await context.prisma.user.findMany({
      include,
    }) as UserWithSubscriptions[];

    const userMap = new Map<string, UserModel>();
    usersWithSubscriptions.forEach(user => {
      userMap.set(user.id, user);
    });

    usersWithSubscriptions.forEach((user) => {
      // Prime DataLoaders for each user using existing data
      if (user.userSubscribedTo && needsUserSubscribedTo) {
        const userAuthors: UserModel[] = [];
        (user.userSubscribedTo as SubscriptionRecord[]).forEach((sub: SubscriptionRecord) => {
          if ('author' in sub && sub.author) {
            userAuthors.push(sub.author);
          } else if ('authorId' in sub && sub.authorId) {
            const authorUser = userMap.get(sub.authorId);
            if (authorUser) {
              userAuthors.push(authorUser);
            }
          }
        });
        context.loaders.userSubscribedToLoader.prime(user.id, userAuthors);
      }
      
      if (user.subscribedToUser && needsSubscribedToUser) {
        const userSubscribers: UserModel[] = [];
        (user.subscribedToUser as SubscriptionRecord[]).forEach((sub: SubscriptionRecord) => {
          if ('subscriber' in sub && sub.subscriber) {
            userSubscribers.push(sub.subscriber);
          } else if ('subscriberId' in sub && sub.subscriberId) {
            const subscriberUser = userMap.get(sub.subscriberId);
            if (subscriberUser) {
              userSubscribers.push(subscriberUser);
            }
          }
        });
        context.loaders.subscribedToUserLoader.prime(user.id, userSubscribers);
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
  const requestedFields = getRequestedFields(info);
  const needsUserSubscribedTo = requestedFields.has('userSubscribedTo');
  const needsSubscribedToUser = requestedFields.has('subscribedToUser');

  if (needsUserSubscribedTo || needsSubscribedToUser) {
    const include: Record<string, boolean> = {};
    if (needsUserSubscribedTo) {
      include.userSubscribedTo = true;
    }
    if (needsSubscribedToUser) {
      include.subscribedToUser = true;
    }

    const userWithSubscriptions = await context.prisma.user.findUnique({
      where: { id: userId },
      include,
    }) as UserWithSubscriptions | null;

    return userWithSubscriptions;
  }

  return context.prisma.user.findUnique({
    where: { id: userId },
  });
}
