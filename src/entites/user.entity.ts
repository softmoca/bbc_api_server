import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseModel } from "./base.entity";
import { PostModel } from "./post.entity";
import { Exclude } from "class-transformer";
import { ChatsModel } from "./chats.entity";
import { MessagesModel } from "./messages.entity";

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

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel;
}
