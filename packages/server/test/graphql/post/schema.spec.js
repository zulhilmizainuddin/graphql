import { expect } from 'chai';

import { graphqlSync, printSchema } from 'graphql';

import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';

describe('schema.gql', () => {
  let mockSchema;

  before(() => {
    const typeDefs = printSchema(loadSchemaSync(`${__dirname}/../../../src/graphql/post/schema.gql`, {
      loaders: [new GraphQLFileLoader()],
    }));

    const schema = makeExecutableSchema({ typeDefs });

    mockSchema = addMocksToSchema({
      schema,
      mocks: {
        Int: () => 6,
        String: () => 'Hello',
      },
      preserveResolvers: false,
      resolvers: (store) => ({
        Mutation: {
          upvotePost: (_, { postId }) => {
            const votes = store.get('Post', 'ROOT', 'votes');

            store.set('Mutation', 'ROOT', 'upvotePost', { votes: votes + 1 });

            return store.get('Mutation', 'ROOT', 'upvotePost');
          },
        },
      }),
    });
  });

  it('posts', () => {
    const query = `
      {
        posts {
          id
          authorId
          title
          votes
        }
      }
      `;

    const { data: { posts } } = graphqlSync(mockSchema, query);
    const [post] = posts;

    expect(posts).to.not.be.empty;

    expect(post).to.deep.equal({
      id: 6,
      authorId: 6,
      title: 'Hello',
      votes: 6,
    });
  });

  it('upvotePost', () => {
    const query = `
      mutation {
        upvotePost(postId: 6) {
          id
          votes
        }
      }
    `;

    const { data: { upvotePost: { votes } } } = graphqlSync(mockSchema, query);

    expect(votes).to.equal(7);
  });
});
