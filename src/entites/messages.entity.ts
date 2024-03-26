import { Column, Entity, ManyToOne } from "typeorm";
import { BaseModel } from "./base.entity";
import { ChatsModel } from "./chats.entity";
import { UsersModel } from "./user.entity";
import { IsString } from "class-validator";

@Entity()
export class MessagesModel extends BaseModel {
  @ManyToOne(() => ChatsModel, (chat) => chat.messages)
  chat: ChatsModel;

  @ManyToOne(() => UsersModel, (user) => user.messages)
  author: UsersModel;

  @Column()
  @IsString()
  message: string;
}
