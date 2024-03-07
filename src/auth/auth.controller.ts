import { Body, Controller, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./dto/register-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("token/access")
  tokenAccess(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post("token/refresh")
  tokenRefresh(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post("login/email")
  loginEmail(@Headers("authorization") rawToken: string) {
    //basic Token
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const email_password = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(email_password);
  }

  @Post("register/email")
  registerEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }
}
