export type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';
export type OpenAPITypes = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
export type OpenAPIParameterLocation = 'path' | 'query' | 'body' | 'header' | 'cookie';

export interface ApiEndpointAttributes<ReqSchema, ResSchema> {
  path: string,
  method: HttpMethod,
  schema: {
    request: ReqSchema,
    response: ResSchema,
  },
}
