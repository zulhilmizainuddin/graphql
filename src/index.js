import 'regenerator-runtime/runtime';

import express from 'express';
import http from 'http';

import { ApolloServer } from 'apollo-server-express';

import { authorLoader } from './graphql/author/resolver';
import { compositeSchema } from './compositeSchema';

(async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema: compositeSchema,
    context: ({
      authorLoader,
    }),
  });

  await server.start();

  server.applyMiddleware({ app });

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
})();
