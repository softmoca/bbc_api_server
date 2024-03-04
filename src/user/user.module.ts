import { UsersModel } from "./../entites/user.entity";
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([UsersModel])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  //다른 모듈에서 import user해도 service는 사용 할 수 없고 export를 해줘야함.
})
export class UserModule {}
