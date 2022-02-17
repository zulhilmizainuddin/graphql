import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';

import { upperDirectivesTransformer } from './directives';

export const generateExecutableSchemasMap = (directory, modules) => modules.reduce((obj, module) => {
  const path = `${directory}/${module}`;

  const schema = loadSchemaSync(`${path}/schema.gql`, {
    loaders: [new GraphQLFileLoader()],
  });

  const { resolvers } = require(`${path}/resolver`);

  let executableSchema = addResolversToSchema({
    schema,
    resolvers,
  });

  executableSchema = upperDirectivesTransformer(executableSchema, 'upper');

  obj[module] = executableSchema;

  return obj;
}, {});
