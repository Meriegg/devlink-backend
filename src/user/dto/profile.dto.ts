import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  programmingLanguage: string;

  @IsOptional()
  @IsString()
  githubAccountLink: string;
}
