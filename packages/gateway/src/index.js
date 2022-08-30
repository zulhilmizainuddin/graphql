import 'regenerator-runtime';

import express from 'express';
import http from 'http';
import Redis from 'ioredis';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import ApolloServerOperationDuration from 'apollo-server-plugin-operation-duration';

import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { MongoClient } from 'mongodb';
import { BaseRedisCache } from 'apollo-server-cache-redis';

import { authorLoader } from './graphql/author/resolver';
import { compositeSchema } from './compositeSchema';
import { Posts } from './graphql/post/Posts';
import { Users } from './graphql/user/Users';
import { registerMetrics, histogram } from './monitoring';

(async () => {
  const app = express();

  app.get('/metrics', registerMetrics);

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer({ schema: compositeSchema }, wsServer);

  const mongoClient = new MongoClient('mongodb://gateway:password@localhost:27017/graphql');

  await mongoClient.connect();

  const server = new ApolloServer({
    schema: compositeSchema,
    context: ({
      authorLoader: authorLoader(),
    }),
    dataSources: () => ({
      posts: new Posts(mongoClient.db().collection('posts')),
      users: new Users(),
    }),
    cache: new BaseRedisCache({
      client: new Redis({
        host: '127.0.0.1',
        port: 6379,
      }),
    }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      responseCachePlugin(),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ApolloServerOperationDuration({
        callback: ({ operationName, operationDuration }) => {
          if (operationName !== 'IntrospectionQuery') {
            histogram.labels(operationName || 'unnamed').observe(operationDuration);
          }
        },
      }),
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
      }),
    ],
  });

  await server.start();

  server.applyMiddleware({ app });

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
})();
