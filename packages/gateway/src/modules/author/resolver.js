import DataLoader from 'dataloader';

const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];

export const authorLoader = () => new DataLoader((ids) => {
  const result = ids.map((authorId) => authors.find((author) => author.id === authorId));

  return Promise.resolve(result);
});

export const resolvers = {
  Query: {
    author: (_, { id }, context) => context.authorLoader.load(id),
  },
};
