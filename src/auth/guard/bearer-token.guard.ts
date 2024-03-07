import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService } from "../auth.service";

import { Reflector } from "@nestjs/core";
import { UserService } from "src/user/user.service";

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers["authorization"];

    if (!rawToken) {
      throw new UnauthorizedException("토큰이 없습니다!");
    }

    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const decoded = await this.authService.verifyToken(token);
    const user = await this.usersService.getUserByEmail(decoded.email);

    req.user = user;
    req.token = token;
    req.tokenType = decoded.type;

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const req = context.switchToHttp().getRequest();

    if (req.tokenType !== "access") {
      throw new UnauthorizedException("Access Token이 아닙니다.");
    }

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const req = context.switchToHttp().getRequest();

    if (req.tokenType !== "refresh") {
      throw new UnauthorizedException("Refresh Token이 아닙니다.");
    }

    return true;
  }
}
