import {
  IsBoolean,
  IsDefined, IsEnum, IsNumber, IsString,
} from 'class-validator';
import { RequestProperty } from '../../../decorator/swagger/api-request-property';
import { ResponseProperty } from '../../../decorator/swagger/api-response-property';

export enum TempEnum {
  A = 'a',
  B = 'b',
  C = 'c',
}

export class TempRequest {
  @IsString()
  @IsDefined()
  @RequestProperty({
    type: 'string',
    in: 'query',
    isRequired: true,
  })
  public nonce: string;
}

export class TempRequestModel {
  @IsString()
  @IsDefined()
  @RequestProperty({
    type: 'string',
    in: 'query',
    isRequired: true,
  })
  public nonce: string;

  @IsNumber()
  @IsDefined()
  @RequestProperty({ type: 'number', in: 'path', isRequired: true })
  testNum: number;

  @IsEnum(TempEnum)
  @IsDefined()
  @RequestProperty({
    type: 'string', enum: TempEnum, in: 'query', isRequired: true,
  })
  testEnum: TempEnum;

  @IsNumber()
  @IsDefined()
  @RequestProperty({ type: 'number', in: 'body', isRequired: true })
  testBodyOne: number;

  @IsString()
  @IsDefined()
  @RequestProperty({ type: 'string', in: 'body', isRequired: true })
  testBodyTwo: number;

  @IsBoolean()
  @IsDefined()
  @RequestProperty({ type: 'boolean', in: 'body', isRequired: false })
  testBodyThree: number;
}

export class TempResponseModel {
  @IsString()
  @IsDefined()
  @ResponseProperty({ type: 'string', isRequired: true, description: 'hi test val' })
  nonce: string;

  @IsNumber()
  @IsDefined()
  @ResponseProperty({ type: 'string', isRequired: false, example: 'asdf-asdf-asdf' })
  ticket: number;
}
