import { Kind } from 'graphql';

export const sortResultsByKeys = (identifier) => (results, keys) => {
  const sortedResults = keys.map((key) => {
    const matchedResult = results.find((result) => result[identifier] === key);

    return matchedResult;
  });

  return sortedResults;
};

export const injectSelections = (selectionFieldNames) => (selectionSet) => ({
  kind: Kind.SELECTION_SET,
  selections: [
    ...selectionFieldNames.map((fieldName) => ({
      kind: Kind.FIELD,
      name: { kind: Kind.NAME, value: fieldName },
    })),
    ...selectionSet.selections,
  ],
});
