import 'regenerator-runtime';

import express from 'express';
import http from 'http';

import { ApolloServer } from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { authorLoader } from './graphql/author/resolver';
import { compositeSchema } from './compositeSchema';

(async () => {
  const app = express();
  const httpServer = http.createServer(app);

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
      authorLoader,
    }),
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          },
        };
      },
    }],
  });

  await server.start();

  server.applyMiddleware({ app });

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
})();
