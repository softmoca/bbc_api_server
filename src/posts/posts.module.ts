import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { PostModel } from "src/entites/post.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PostModel]), AuthModule, UserModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
