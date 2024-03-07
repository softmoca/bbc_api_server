import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from "@nestjs/common";
import { UsersModel } from "src/entites/user.entity";

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new InternalServerErrorException(
        "Request에 user 프로퍼티가 존재하지 않습니다!"
      );
    }
    return user;
  }
);
