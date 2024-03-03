import { PickType } from "@nestjs/swagger";
import { UsersModel } from "src/entites/user.entity";

export class SignUpDto extends PickType(UsersModel, [
  "email",
  "nickName",
  "password",
  "university",
]) {}
