import { IsDefined, IsString } from 'class-validator';
import { ResponseProperty } from '../../../decorator/swagger/api-response-property';

export class HealthRequest {}

export class HealthResponse {
  @IsString()
  @IsDefined()
  @ResponseProperty({
    type: 'string', isRequired: true, description: 'OK', example: 'OK',
  })
  message: string;
}
