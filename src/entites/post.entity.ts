import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseModel } from "./base.entity";
import { UsersModel } from "./user.entity";

@Entity()
export class PostModel extends BaseModel {
  @Column()
  postTitle: string;

  @Column()
  postContent: string;

  @Column("int", { default: 0 })
  postLike: number;

  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;
}
