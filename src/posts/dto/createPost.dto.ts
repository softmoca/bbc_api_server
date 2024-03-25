import { PickType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PostModel } from "src/entites/post.entity";

export class CreatePostDto extends PickType(PostModel, [
  "postTitle",
  "postContent",
]) {
  @IsString({
    each: true,
  })
  @IsOptional()
  images: string[] = [];
}
