import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  programmingLanguage: string;

  @IsOptional()
  @IsString()
  githubAccountLink: string;

  @IsString()
  username: string;
}

export class LoginDto {
  @IsEmail()
  @IsString()
  email: string;
  @IsString()
  password: string;
}
