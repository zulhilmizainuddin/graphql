import fetch from 'cross-fetch';
import ws from 'ws';

import {
  split, HttpLink, ApolloClient, InMemoryCache, gql,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  fetch,
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
  },
  webSocketImpl: ws,
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition'
      && definition.operation === 'subscription'
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
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.error(JSON.stringify(err, null, 2));
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
      console.log(JSON.stringify(data, null, 2));
    },
    error(err) {
      console.error(JSON.stringify(err, null, 2));
    },
  });
