import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseModel } from "./base.entity";
import { PostModel } from "./post.entity";
import { Exclude } from "class-transformer";
import { ChatsModel } from "./chats.entity";
import { MessagesModel } from "./messages.entity";
import { IsEmail, IsNumber, IsString } from "class-validator";

@Entity()
export class UsersModel extends BaseModel {
  @Column()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @IsString()
  @Column()
  nickName: string;

  @IsString()
  @Column()
  university: string;

  @IsString()
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
