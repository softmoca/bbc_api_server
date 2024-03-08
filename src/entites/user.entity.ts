import { Column, Entity, OneToMany } from "typeorm";
import { BaseModel } from "./base.entity";
import { PostModel } from "./post.entity";
import { Exclude } from "class-transformer";

@Entity()
export class UsersModel extends BaseModel {
  @Column()
  email: string;

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column()
  nickName: string;

  @Column()
  university: string;

  @Column()
  phone: string;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];
}
