/* eslint-disable array-callback-return */
import 'reflect-metadata';
import fs from 'fs';
import _ from 'lodash';
import swaggerJsdoc from 'swagger-jsdoc';

import v1Router from '../route/v1';
import { ApiRequestPropertyAttributes } from '../decorator/swagger/api-request-property';
import { ApiResponsePropertyAttributes } from '../decorator/swagger/api-response-property';

const initOpenAPIDocs = () => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'This is my API Document',
        description: 'test',
        version: '1.0.0',
      },
      schemes: ['http', 'https'],
      securityDefinitions: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
          name: 'Authorization',
          description: 'User Authorization Token',
        },
      },
    },
    apis: [],
  };

  const swaggerDoc = swaggerJsdoc(options);

  return swaggerDoc;
}

const initApiEndpoints = () => {
  const apiResources: { [key: string]: any } = {};

  // Mapping endpoints
  v1Router.controllers.map((controller) => {
    const rootPath = Reflect.getMetadata('tag', controller.constructor);
    const className = controller.constructor.name;

    // Controller required
    if (rootPath) {
      Object.keys(controller.constructor.prototype.swaggerDocs).map((path: string) => {
        // Init root path
        const endpoint = _.replace(path, new RegExp(`@${className}`, 'g'), rootPath);
        Object.assign(apiResources, { [endpoint]: controller.constructor.prototype.swaggerDocs[path] });

        Object.keys(apiResources[endpoint]).map((httpMethods: string) => {
          apiResources[endpoint][httpMethods].tags.push(rootPath);
        })
      })
    }
  });

  return apiResources;
}

const mappingParameters = (apiResources: { [key: string]: any }) => {
  // Mapping request, response schemas
  Object.keys(apiResources).map((endpoint: string) => {
    Object.keys(apiResources[endpoint]).map((httpMethod: string) => {
      const { requestSchema } = apiResources[endpoint][httpMethod];
      const { responseSchema } = apiResources[endpoint][httpMethod];

      if (!requestSchema.prototype || !responseSchema.prototype) {
        throw new Error('Api document schema should be class');
      }
      // Mapping request parameters
      Object.keys(requestSchema.prototype).map((parameterName: string) => {
        const param: ApiRequestPropertyAttributes = requestSchema.prototype[parameterName];

        // Exclude body parameters first
        if (param.in !== 'body') {
          const schema = {};
          if (param.isArray) {
          // Array parameter
            Object.assign(schema, {
              type: 'array',
              items: {
                type: param.type,
              },
            })
          } else if (param.enum) {
          // Enum parameter
            Object.assign(schema, {
              type: param.type,
              enum: Object.values(param.enum),
            });
          } else {
            Object.assign(schema, { type: param.type });
          }

          apiResources[endpoint][httpMethod].parameters.push({
            name: parameterName,
            in: param.in,
            required: param.isRequired,
            description: param.description || '',
            schema,
          });
        } else {
        // Init request body map
          if (!apiResources[endpoint][httpMethod].requestBody) {
            Object.assign(apiResources[endpoint][httpMethod], {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {},
                      required: [],
                    },
                  },
                },
              },
            });
          }

          // Init request body parameter info
          const schema = {}
          if (param.isArray) {
          // Array parameter
            Object.assign(schema, {
              type: 'array',
              items: { type: param.type },
            });
          } else if (param.enum) {
          // Enum parameter
            Object.assign(schema, {
              type: 'enum',
              enum: Object.values(param.enum),
            });
          } else {
            Object.assign(schema, {
              type: param.type,
            });
          }

          // Mapping request body in docs object
          Object.assign(apiResources[endpoint][httpMethod].requestBody.content['application/json'].schema.properties, {
            [parameterName]: schema,
          });

          // Mapping required params
          if (param.isRequired) {
            apiResources[endpoint][httpMethod].requestBody.content['application/json'].schema.required.push(parameterName);
          }
        }
      });

      // Mapping response parameters
      Object.keys(responseSchema.prototype).map((parameterName: string) => {
        const param: ApiResponsePropertyAttributes = responseSchema.prototype[parameterName];

        const schema = {
          type: param.type,
          description: param.description || '',
          example: param.example || undefined,
        }
        // Mapping response property in docs object
        Object.assign(apiResources[endpoint][httpMethod].responses['200'].content['application/json'].schema.properties, {
          [parameterName]: schema,
        });

        // Mapping required params
        if (param.isRequired) {
          apiResources[endpoint][httpMethod].responses['200'].content['application/json'].schema.required.push(parameterName);
        }
      });
    });
  });

  return apiResources;
}

const generateSwaggerDocument = () => {
  const swaggerDoc = initOpenAPIDocs();
  const endpoints = initApiEndpoints();
  const apiResources = mappingParameters(endpoints);

  Object.assign(swaggerDoc, { paths: apiResources });

  fs.writeFileSync(`${__dirname}/../../docs/swagger-spec.json`, JSON.stringify(swaggerDoc));

  return swaggerDoc;
}

generateSwaggerDocument();
