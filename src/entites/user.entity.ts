import { Column, Entity, OneToMany } from "typeorm";
import { BaseModel } from "./base.entity";
import { PostModel } from "./post.entity";

@Entity()
export class UsersModel extends BaseModel {
  @Column()
  email: string;

  @Column()
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
