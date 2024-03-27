import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { UsersModel } from "src/entites/user.entity";
import { PostsService } from "src/posts/posts.service";
import { UserService } from "src/user/user.service";
import { AuthService } from "../auth.service";

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(
    private readonly postService: PostsService,
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

    if (!user) {
      throw new UnauthorizedException("사용자 정보를 가져올 수 없습니다.");
    }

    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException("Post ID가 파라미터로 제공 돼야합니다.");
    }

    const isOk = await this.postService.isPostMine(user.id, parseInt(postId));

    if (!isOk) {
      throw new ForbiddenException("권한이 없습니다.");
    }

    return true;
  }
}
