import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { SignUpDto } from "./dto/signUp.dto";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers() {
    return this.userService.getUserByEmail("moca@naver.com");
  }
}
