import { Column, Entity, ManyToOne } from "typeorm";
import { BaseModel } from "./base.entity";
import { UsersModel } from "./user.entity";
import { PostModel } from "./post.entity";
import { IsNumber, IsString } from "class-validator";

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.postComments)
  author: UsersModel;

  @ManyToOne(() => PostModel, (post) => post.comments)
  post: PostModel;

  @Column()
  @IsString()
  comment: string;

  @Column({
    default: 0,
  })
  @IsNumber()
  likeCount: number;
}
