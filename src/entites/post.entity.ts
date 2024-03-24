import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseModel } from "./base.entity";
import { UsersModel } from "./user.entity";
import { IsString } from "class-validator";

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

  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
    // eager: true,
  })
  author: UsersModel;
}
