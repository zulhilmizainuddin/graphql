import WebSocket from 'ws';

import { fetch } from 'cross-undici-fetch';
import { print, getOperationAST, OperationTypeNode } from 'graphql';

import { loadSchemaSync } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { wrapSchema } from '@graphql-tools/wrap';
import { observableToAsyncIterable } from '@graphql-tools/utils';
import { createClient } from 'graphql-ws';

import { config } from '../../config/config';
import { logger } from '../../utils/logger';

const { REMOTE_SCHEMA_HTTP_ENDPOINT, REMOTE_SCHEMA_WS_ENDPOINT } = config;

const schema = loadSchemaSync(REMOTE_SCHEMA_HTTP_ENDPOINT, {
  loaders: [new UrlLoader()],
});

const subscriptionClient = createClient({
  url: REMOTE_SCHEMA_WS_ENDPOINT,
  webSocketImpl: WebSocket,
  lazy: false,
});

const httpExecutor = async ({
  document, variables, operationName, extensions,
}) => {
  const query = print(document);

  const fetchResult = await fetch(REMOTE_SCHEMA_HTTP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query, variables, operationName, extensions,
    }),
  });

  return fetchResult.json();
};

const wsExecutor = async ({
  document, variables, operationName, extensions,
}) => observableToAsyncIterable({
  subscribe: (observer) => ({
    unsubscribe: subscriptionClient.subscribe(
      {
        query: print(document),
        variables,
        operationName,
        extensions,
      },
      {
        next: (data) => observer.next && observer.next(data),
        error: (err) => {
          if (!observer.error) {
            return;
          }

          if (err instanceof Error) {
            observer.error(err);
          } else if (err instanceof Event) {
            logger.error(err);
            observer.error(new Error(`Socket closed with event ${err.code}`));
          } else if (Array.isArray(err)) {
            // GraphQLError[]
            observer.error(new Error(err.map(({ message }) => message).join(', ')));
          }
        },
        complete: () => observer.complete && observer.complete(),
      },
    ),
  }),
});

const executor = async (args) => {
  const operation = getOperationAST(args.document, args.operationName);

  if (operation?.operation === OperationTypeNode.SUBSCRIPTION) {
    return wsExecutor(args);
  }

  return httpExecutor(args);
};

export const executable = wrapSchema({
  schema,
  executor,
});
