import { HttpMethod } from '../../swagger/model/types';

export interface ApiEndpointAttributes<ReqSchema, ResSchema> {
  path: string,
  method: HttpMethod,
  schema: {
    request: ReqSchema,
    response: ResSchema,
  },
}

// Mapping api endpoints with schemas
export function ApiEndpoint<ReqSchema, ResSchema>(attributes: ApiEndpointAttributes<ReqSchema, ResSchema>) {
  return function initApiEndpoint(target: { [key: string]: any }, propertyKey: string) {
    const controllerName = target.constructor.name;

    if (!target.swaggerDocs) {
      Object.assign(target, { swaggerDocs: {} });
    }

    const endpoint = `/@${controllerName}/${attributes.path}`;
    if (!target.swaggerDocs[endpoint]) {
      Object.assign(target.swaggerDocs, { [endpoint]: {} });
    }

    Object.assign(target.swaggerDocs[endpoint], {
      [attributes.method]: {
        tags: [],
        parameters: [],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [],
                  properties: {},
                },
              },
            },
          },
        },
        requestSchema: attributes.schema.request,
        responseSchema: attributes.schema.response,
      },
    });
  };
}
