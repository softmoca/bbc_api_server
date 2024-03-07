import { PickType } from "@nestjs/swagger";
import { PostModel } from "src/entites/post.entity";

export class CreatePostDto extends PickType(PostModel, [
  "postTitle",
  "postContent",
]) {}
