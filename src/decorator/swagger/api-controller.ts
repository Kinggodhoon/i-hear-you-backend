import 'reflect-metadata';

// Mapping root path metadata in api controller
export const ApiContoller = (tag: string) => (constructor: Function) => {
  Reflect.defineMetadata('tag', tag, constructor);
}
