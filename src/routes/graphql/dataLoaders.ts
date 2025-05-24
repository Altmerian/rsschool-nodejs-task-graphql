import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';
import {
  User as UserModel,
  Post as PostModel,
  Profile as ProfileModel,
  MemberType as MemberTypeModel,
} from './types/graphql-types.js';

/**
 * Creates DataLoader instances for optimizing GraphQL data fetching
 * Each loader uses a single findMany call to batch database queries
 */
export function createDataLoaders(prisma: PrismaClient) {
  /**
   * Loads profiles for given user IDs
   * Input: userId[]
   * Output: Profile[]
   */
  const userProfileLoader = new DataLoader<string, ProfileModel | null>(
    async (userIds: readonly string[]): Promise<(ProfileModel | null)[]> => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: [...userIds] } },
      });

      // Create a map for O(1) lookup
      const profileMap = new Map<string, ProfileModel>();
      profiles.forEach((profile) => {
        profileMap.set(profile.userId, profile);
      });

      return userIds.map((userId) => profileMap.get(userId) || null);
    }
  );

  /**
   * Loads posts for given user IDs (author IDs)
   * Input: userId[]
   * Output: Post[][]
   */
  const userPostsLoader = new DataLoader<string, PostModel[]>(
    async (userIds: readonly string[]): Promise<PostModel[][]> => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: [...userIds] } },
      });

      const postsMap = new Map<string, PostModel[]>();
      posts.forEach((post) => {
        if (!postsMap.has(post.authorId)) {
          postsMap.set(post.authorId, []);
        }
        postsMap.get(post.authorId)!.push(post);
      });

      return userIds.map((userId) => postsMap.get(userId) || []);
    }
  );

  /**
   * Loads member types for given profile IDs
   * Input: profileId[]
   * Output: MemberType[]
   */
  const profileMemberTypeLoader = new DataLoader<string, MemberTypeModel | null>(
    async (profileIds: readonly string[]): Promise<(MemberTypeModel | null)[]> => {
      // First get the profiles to extract memberTypeIds
      const profiles = await prisma.profile.findMany({
        where: { id: { in: [...profileIds] } },
        select: { id: true, memberTypeId: true },
      });

      // Extract unique memberTypeIds
      const memberTypeIds = [...new Set(profiles.map((p) => p.memberTypeId))];

      // Fetch member types
      const memberTypes = await prisma.memberType.findMany({
        where: { id: { in: memberTypeIds } },
      });

      // Create maps for lookup
      const profileToMemberTypeIdMap = new Map<string, string>();
      profiles.forEach((profile) => {
        profileToMemberTypeIdMap.set(profile.id, profile.memberTypeId);
      });

      const memberTypeMap = new Map<string, MemberTypeModel>();
      memberTypes.forEach((memberType) => {
        memberTypeMap.set(memberType.id, memberType);
      });

      return profileIds.map((profileId) => {
        const memberTypeId = profileToMemberTypeIdMap.get(profileId);
        return memberTypeId ? memberTypeMap.get(memberTypeId) || null : null;
      });
    }
  );

  /**
   * Loads users that the given user IDs are subscribed to
   * Input: userId[]
   * Output: User[][]
   */
  const userSubscribedToLoader = new DataLoader<string, UserModel[]>(
    async (userIds: readonly string[]): Promise<UserModel[][]> => {
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: { in: [...userIds] } },
        include: { author: true },
      });

      const subscriptionsMap = new Map<string, UserModel[]>();
      subscriptions.forEach((subscription) => {
        if (!subscriptionsMap.has(subscription.subscriberId)) {
          subscriptionsMap.set(subscription.subscriberId, []);
        }
        subscriptionsMap.get(subscription.subscriberId)!.push(subscription.author);
      });

      return userIds.map((userId) => subscriptionsMap.get(userId) || []);
    }
  );

  /**
   * Loads users that are subscribed to the given user IDs (authors)
   * Input: userId[]
   * Output: User[][]
   */
  const subscribedToUserLoader = new DataLoader<string, UserModel[]>(
    async (userIds: readonly string[]): Promise<UserModel[][]> => {
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: { in: [...userIds] } },
        include: { subscriber: true },
      });

      const subscriptionsMap = new Map<string, UserModel[]>();
      subscriptions.forEach((subscription) => {
        if (!subscriptionsMap.has(subscription.authorId)) {
          subscriptionsMap.set(subscription.authorId, []);
        }
        subscriptionsMap.get(subscription.authorId)!.push(subscription.subscriber);
      });

      return userIds.map((userId) => subscriptionsMap.get(userId) || []);
    }
  );

  return {
    userProfileLoader,
    userPostsLoader,
    profileMemberTypeLoader,
    userSubscribedToLoader,
    subscribedToUserLoader,
  };
}

export type DataLoaders = ReturnType<typeof createDataLoaders>;
