import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { CommentsService } from "src/posts/comments/comments.service";
import { UsersModel } from "src/entites/user.entity";
import { UserService } from "src/user/user.service";
import { AuthService } from "../auth.service";

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(
    private readonly commentService: CommentsService,
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

    const commentId = req.params.commentId;

    const isOk = await this.commentService.isCommentMine(
      user.id,
      parseInt(commentId)
    );

    if (!isOk) {
      throw new ForbiddenException("권한이 없습니다.");
    }

    return true;
  }
}
