import { gql } from 'apollo-server-express';
import { stitchSchemas } from '@graphql-tools/stitch';
import { delegateToSchema } from '@graphql-tools/delegate';

import { generateExecutableSchemasMap } from './executableSchema';

const modules = ['author', 'post', 'user'];

const executableSchemaMap = generateExecutableSchemasMap(`${__dirname}/graphql`, modules);

const executableSchemaArray = modules.reduce((arr, module) => {
  arr.push(executableSchemaMap[module]);

  return arr;
}, []);

export const compositeSchema = stitchSchemas({
  subschemas: executableSchemaArray,
  typeDefs: gql`
    extend type Author {
      posts: [Post]
    }

    extend type Post {
      author: Author
    }
  `,
  resolvers: {
    Author: {
      posts: (parent, _, context, info) => delegateToSchema({
        schema: executableSchemaMap.post,
        operation: 'query',
        fieldName: 'postsByAuthor',
        args: {
          id: parent.id,
        },
        context,
        info,
      }),
    },
    Post: {
      author: (parent, _, context, info) => delegateToSchema({
        schema: executableSchemaMap.author,
        operation: 'query',
        fieldName: 'author',
        args: {
          id: parent.authorId,
        },
        context,
        info,
      }),
    },
  },
});
