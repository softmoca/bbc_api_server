import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseModel } from "./base.entity";
import { UsersModel } from "./user.entity";
import { IsString } from "class-validator";
import { ImageModel } from "./image.entity";
import { CommentsModel } from "./comments.entity";

@Entity()
export class PostModel extends BaseModel {
  @IsString()
  @Column()
  postTitle: string;

  @IsString()
  @Column()
  postContent: string;

  @Column("int", { default: 0 })
  postLike: number;

  @Column("int", { default: 0 })
  commentCount: number;

  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
    // eager: true,
  })
  author: UsersModel;

  @OneToMany((type) => ImageModel, (image) => image.post)
  images: ImageModel[];

  @OneToMany(() => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];
}
