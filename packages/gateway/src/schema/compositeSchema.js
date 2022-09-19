import { gql } from 'apollo-server-core';
import { stitchSchemas } from '@graphql-tools/stitch';
import { delegateToSchema } from '@graphql-tools/delegate';
import { batchDelegateToSchema } from '@graphql-tools/batch-delegate';
import { TransformQuery } from '@graphql-tools/wrap';

import { OperationTypeNode } from 'graphql';

import { generateExecutableSchemasMap } from './executableSchema';
import { injectSelections, sortResultsByKeys } from '../utils/batchDelegateHelper';

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
          return batchDelegateToSchema({
            schema: executableSchemaMap.author,
            operation: OperationTypeNode.QUERY,
            fieldName: 'authors',
            key: post.authorId,
            argsFromKeys: (ids) => ({ ids }),
            valuesFromResults: sortResultsByKeys('id'),
            transforms: [
              new TransformQuery({
                path: ['authors'],
                queryTransformer: injectSelections(['id']),
              }),
            ],
            context,
            info,
          });
        },
      },
    },
  },
});
