import { PartialType } from "@nestjs/swagger";
import { CreatePostDto } from "./createPost.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  @IsOptional()
  postTitle?: string;

  @IsString()
  @IsOptional()
  postContent?: string;
}
