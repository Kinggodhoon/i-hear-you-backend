import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsOptional, IsString } from 'class-validator';

export interface QuizmapListing {
  title: string;
  description: string;
  quizCount: number;
  thumbnail: string;
  downloadLink: string;
}

export class GetQuizmapListingResponse {
  quizmaps: Array<QuizmapListing>
}

export class Quizmap {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsDefined()
  @IsString()
  title: string;

  @IsDefined()
  @IsString()
  description: string;

  @IsDefined()
  @IsString()
  thumbnail: string;

  @IsArray()
  questions: Array<object>;
}
