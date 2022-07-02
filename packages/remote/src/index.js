import 'regenerator-runtime';

import express from 'express';
import http from 'http';

import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
// import { KafkaPubSub } from 'graphql-kafka-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { makeExecutableSchema } from '@graphql-tools/schema';

(async () => {
  // const pubsub = new KafkaPubSub({
  //   host: 'kafka',
  //   port: '9092',
  //   topic: 'book_events',
  //   groupId: 'book_events_subscriber',
  // });

  const pubsub = new RedisPubSub({
    connection: {
      host: 'redis',
    },
  });

  const typeDefs = gql`
    type Book {
      title: String
      author: String
    }

    type Query {
      books: [Book]
    }

    type Subscription {
      books: [Book]
  }
`;

  const books = [
    {
      title: 'The Awakening',
      author: 'Kate Chopin',
    },
    {
      title: 'City of Glass',
      author: 'Paul Auster',
    },
  ];

  const resolvers = {
    Query: {
      books: async () => {
        await pubsub.publish('BOOKS', {
          books,
        });

        return books;
      },
    },
    Subscription: {
      books: {
        subscribe: () => pubsub.asyncIterator(['BOOKS']),
      },
    },
  };

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  server.applyMiddleware({ app });

  const PORT = 4001;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
})();
