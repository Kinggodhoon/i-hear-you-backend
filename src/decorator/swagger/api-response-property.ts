import { OpenAPITypes } from '../../swagger/model/types';

export interface ApiResponsePropertyAttributes {
  type: OpenAPITypes,
  isRequired: boolean,
  description?: string,
  example?: any,
}

// Mapping response properties
export function ResponseProperty(attributes: ApiResponsePropertyAttributes) {
  return function initApiProperty(target: { [key: string]: any }, propertyKey: string) {
    Object.assign(target, { [propertyKey]: attributes });
  };
}
