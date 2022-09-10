export const resolvers = {
  Query: {
    me: async (_, __, { dataSources: { users } }) => users.getUser(),
  },
};
