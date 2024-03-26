import { Entity, ManyToMany, OneToMany } from "typeorm";
import { BaseModel } from "./base.entity";
import { UsersModel } from "./user.entity";
import { MessagesModel } from "./messages.entity";

@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany(() => UsersModel, (user) => user.chats)
  users: UsersModel[];

  @OneToMany(() => MessagesModel, (message) => message.chat)
  messages: MessagesModel;
}
