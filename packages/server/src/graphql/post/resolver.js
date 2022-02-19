import * as Logger from 'bunyan';

import { PubSub } from 'graphql-subscriptions';
import { KafkaPubSub } from 'graphql-kafka-subscriptions';

const localPubSub = new PubSub();

const kafkaPubSub = new KafkaPubSub({
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

const pubsub = localPubSub || kafkaPubSub;

const posts = [
  {
    id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2,
  },
  {
    id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3,
  },
  {
    id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1,
  },
  {
    id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7,
  },
];

export const resolvers = {
  Query: {
    posts: () => posts,
    postsByAuthor: (_, { id }) => posts.filter((post) => post.authorId === id),
  },
  Mutation: {
    upvotePost: (_, { postId }) => {
      const post = posts.find((post) => post.id === postId);

      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }

      post.votes += 1;

      pubsub.publish('POST_UPVOTED', {
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
