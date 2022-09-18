import fetch from 'cross-fetch';
import pino from 'pino';
import ws from 'ws';

import {
  split, HttpLink, ApolloClient, InMemoryCache, gql,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { OperationTypeNode } from 'graphql';

const logger = pino();

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  fetch,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    webSocketImpl: ws,
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition'
      && definition.operation === OperationTypeNode.SUBSCRIPTION
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

client
  .query({
    query: gql`
    query {
      posts {
        id
        authorId
        title
        votes
        author {
          id
          firstName
          lastName
        }
      }
    }
  `,
  })
  .then(({ data }) => {
    logger.info(data, 'Query response');
  })
  .catch((err) => {
    logger.error(err, 'Query error');
  });

client
  .subscribe({
    query: gql`
      subscription {
        postUpvoted {
          id
          authorId
          title
          votes
        }
      }
    `,
  })
  .subscribe({
    next({ data }) {
      logger.info(data, 'Subscription response');
    },
    error(err) {
      logger.error(err, 'Subscription error');
    },
  });
