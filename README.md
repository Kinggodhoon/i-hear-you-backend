# Serverless boilerplate
simple serverless boilerplate

- typescript
- serverless
- postgresql

swagger in github pages

## Features

Custom features

| Category | Method | Feature | Directory location |
| ------ | ------ | ------ | ------ |
| **Validating** | `parameterValidate` | Custom parameter validator with method chaining, and request parameters in Request extended interface model  | src/middleware/parameter.validate.ts |
| **Database** | `Database` class | custom query runner with PreparedStatement | src/database/database.ts |
| **Documentation** | `@ApiController` | Use swagger in express like NestJs, Controller is setting document root path and tags | src/decorator/swagger/api-controller.ts |
|  | `@ApiEndpoint` | Mapping endpoints, http methods, request, response schemas | src/decorator/swagger/api-endpoint.ts |
|  | `@ApiRequestPropertyAttributes` | Mapping api properties for Request schema | src/decorator/swagger/api-request-property.ts |
|  | `@ApiResponsePropertyAttributes` | Mapping api properties for Response schema | src/decorator/swagger/api-response-property.ts |