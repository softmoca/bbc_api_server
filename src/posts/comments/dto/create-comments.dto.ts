import { PickType } from "@nestjs/swagger";
import { CommentsModel } from "src/entites/comments.entity";

export class CreateCommentsDto extends PickType(CommentsModel, ["comment"]) {}
