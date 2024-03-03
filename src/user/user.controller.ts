import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { SignUpDto } from "./dto/signUp.dto";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Post("signup")
  async SignUp(@Body() signUpDto: SignUpDto) {
    return this.userService.signUp(signUpDto);
  }
}
