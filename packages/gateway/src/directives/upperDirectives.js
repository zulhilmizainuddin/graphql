import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

export const upperDirectivesTransformer = (schema, directiveName) => mapSchema(schema, {
  [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
    const upperDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

    if (upperDirective) {
      const { resolve = defaultFieldResolver } = fieldConfig;

      fieldConfig.resolve = async (source, args, context, info) => {
        const result = await resolve(source, args, context, info);
        if (typeof result === 'string') {
          return result.toUpperCase();
        }

        return result;
      };

      return fieldConfig;
    }
  },
});
