import 'regenerator-runtime';

import express from 'express';
import http from 'http';
import Redis from 'ioredis';
import responseCachePlugin from 'apollo-server-plugin-response-cache';

import { ApolloServer } from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { MongoClient } from 'mongodb';
import { BaseRedisCache } from 'apollo-server-cache-redis';

import { authorLoader } from './graphql/author/resolver';
import { compositeSchema } from './compositeSchema';
import { Posts } from './graphql/post/Posts';

(async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const mongoClient = new MongoClient('mongodb://server:password@localhost:27017/graphql');

  await mongoClient.connect();

  const subscriptionServer = SubscriptionServer.create({
    schema: compositeSchema,
    execute,
    subscribe,
  }, {
    server: httpServer,
    path: '/graphql',
  });

  const server = new ApolloServer({
    schema: compositeSchema,
    context: ({
      authorLoader: authorLoader(),
    }),
    dataSources: () => ({
      posts: new Posts(mongoClient.db().collection('posts')),
    }),
    cache: new BaseRedisCache({
      client: new Redis({
        host: '127.0.0.1',
        port: 6379,
      }),
    }),
    plugins: [
      responseCachePlugin(),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();

  server.applyMiddleware({ app });

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
})();
