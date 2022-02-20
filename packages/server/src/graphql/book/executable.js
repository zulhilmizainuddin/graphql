import { fetch } from 'cross-undici-fetch';
import { print } from 'graphql';

import { loadSchemaSync } from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { wrapSchema } from '@graphql-tools/wrap';

const schema = loadSchemaSync('http://localhost:4001/', {
  loaders: [new UrlLoader()],
});

const executor = async ({ document, variables }) => {
  const query = print(document);

  const fetchResult = await fetch('http://localhost:4001/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  return fetchResult.json();
};

export const executable = wrapSchema({
  schema,
  executor,
});
