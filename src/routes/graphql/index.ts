import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { parse, validate, execute } from 'graphql';
import { graphQLSchema } from './schema.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      try {
        const document = parse(req.body.query);

        const validationErrors = validate(graphQLSchema, document, [depthLimit(5)]);

        if (validationErrors.length > 0) {
          return { errors: validationErrors };
        }

        return await execute({
          schema: graphQLSchema,
          document,
          variableValues: req.body.variables,
          contextValue: { prisma },
        });
      } catch (error) {
        return { errors: [error] };
      }
    },
  });
};

export default plugin;
