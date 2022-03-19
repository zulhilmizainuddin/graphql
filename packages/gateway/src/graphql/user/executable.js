import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';

import { resolvers } from './resolver';

const schema = loadSchemaSync(`${__dirname}/schema.gql`, {
  loaders: [new GraphQLFileLoader()],
});

export const executable = addResolversToSchema({
  schema,
  resolvers,
});
