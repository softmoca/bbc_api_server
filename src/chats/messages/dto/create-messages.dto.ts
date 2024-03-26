import { PickType } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { MessagesModel } from "src/entites/messages.entity";

export class CreateMessagesDto extends PickType(MessagesModel, ["message"]) {
  @IsNumber()
  chatId: number;
}
