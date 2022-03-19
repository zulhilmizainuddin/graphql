import * as Logger from 'bunyan';

import { KafkaPubSub } from 'graphql-kafka-subscriptions';

const pubsub = new KafkaPubSub({
  host: 'localhost',
  port: '9092',
  topic: 'post_events',
  groupId: 'post_events_subscriber',
  logger: Logger.createLogger({
    name: 'pubsub',
    stream: process.stdout,
    level: 'debug',
  }),
  // globalConfig: {
  //   debug: 'consumer',
  // },
});

export const resolvers = {
  Query: {
    posts: async (_, __, { dataSources: { posts } }) => posts.getPosts(),
    postsByAuthor: async (_, { id }, { dataSources: { posts } }) => posts.getPostsByAuthorId(id),
  },
  Mutation: {
    upvotePost: async (_, { postId }, { dataSources: { posts } }) => {
      const post = await posts.getUpdatedPostById(postId);

      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }

      await pubsub.publish('POST_UPVOTED', {
        postUpvoted: {
          ...post,
        },
      });

      return post;
    },
  },
  Subscription: {
    postUpvoted: {
      subscribe: () => pubsub.asyncIterator(['POST_UPVOTED']),
    },
  },
};
