import { IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  textContent?: string;

  @IsString()
  @IsOptional()
  code?: string;
}

export class EditPostDto {
  @IsString()
  @IsOptional()
  textContent?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  postId: string;
}

export class DeletePostDto {
  @IsString()
  postId: string;
}

export class GetPostDto {
  @IsString()
  postId: string;
}
