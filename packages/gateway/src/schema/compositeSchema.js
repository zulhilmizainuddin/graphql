import { gql } from 'apollo-server-core';
import { stitchSchemas } from '@graphql-tools/stitch';
import { delegateToSchema } from '@graphql-tools/delegate';

import { OperationTypeNode } from 'graphql';

import { generateExecutableSchemasMap } from './executableSchema';

const modules = ['author', 'post', 'user', 'book'];

const executableSchemaMap = generateExecutableSchemasMap(`${__dirname}/../modules`, modules);

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
      posts: {
        selectionSet: '{ id }',
        resolve(author, _args, context, info) {
          return delegateToSchema({
            schema: executableSchemaMap.post,
            operation: OperationTypeNode.QUERY,
            fieldName: 'postsByAuthor',
            args: {
              id: author.id,
            },
            context,
            info,
          });
        },
      },
    },
    Post: {
      author: {
        selectionSet: '{ authorId }',
        resolve(post, _args, context, info) {
          return delegateToSchema({
            schema: executableSchemaMap.author,
            operation: OperationTypeNode.QUERY,
            fieldName: 'author',
            args: {
              id: post.authorId,
            },
            context,
            info,
          });
        },
      },
    },
  },
});
