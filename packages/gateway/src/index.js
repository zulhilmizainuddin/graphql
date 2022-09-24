import 'regenerator-runtime';

import './utils/opentelemetry';

import fastify from 'fastify';
import Redis from 'ioredis';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import ApolloServerOperationDuration from 'apollo-server-plugin-operation-duration';

import { ApolloServer } from 'apollo-server-fastify';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { MongoClient } from 'mongodb';
import { BaseRedisCache } from 'apollo-server-cache-redis';

import { config } from './config/config';
import { authorLoader } from './modules/author/resolver';
import { compositeSchema } from './schema/compositeSchema';
import { Posts } from './modules/post/Posts';
import { Users } from './modules/user/Users';
import { logger } from './utils/logger';
import { registerMetrics, histogram } from './utils/monitoring';

const {
  PORT, GRAPHQL_PATH, MONGO_URL, REDIS_HOST, REDIS_PORT,
} = config;

(async () => {
  const app = fastify({
    logger,
    disableRequestLogging: true,
  });

  app.get('/metrics', registerMetrics);

  const wsServer = new WebSocketServer({
    server: app.server,
    path: GRAPHQL_PATH,
  });

  const serverCleanup = useServer({ schema: compositeSchema }, wsServer);

  const mongoClient = new MongoClient(MONGO_URL);

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
        host: REDIS_HOST,
        port: REDIS_PORT,
      }),
    }),
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await app.close();
              await serverCleanup.dispose();
            },
          };
        },
      },
      ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
      responseCachePlugin(),
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

  app.register(server.createHandler());

  await app.listen(PORT);

  logger.info(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
})();
