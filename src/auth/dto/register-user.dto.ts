import { PickType } from "@nestjs/mapped-types";
import { UsersModel } from "src/entites/user.entity";

export class RegisterUserDto extends PickType(UsersModel, [
  "nickName",
  "email",
  "password",
  "university",
  "phone",
]) {}
