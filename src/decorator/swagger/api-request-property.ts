import { OpenAPIParameterLocation, OpenAPITypes } from '../../swagger/model/types';

export interface ApiRequestPropertyAttributes {
  type: OpenAPITypes,
  in: OpenAPIParameterLocation,
  isRequired: boolean,
  description?: string,
  isArray?: boolean,
  enum?: any[] | Record<string, any> | (() => (any[] | Record<string, any>)),
}

// mapping metadata in api properties
export function RequestProperty(attributes: ApiRequestPropertyAttributes) {
  return function initApiProperty(target: { [key: string]: any }, propertyKey: string) {
    Object.assign(target, { [propertyKey]: attributes });
  };
}
