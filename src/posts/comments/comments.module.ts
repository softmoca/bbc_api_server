import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentsModel } from "src/entites/comments.entity";
import { CommonModule } from "src/common/common.module";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { PostsModule } from "../posts.module";
import { PostExistsMiddelware } from "src/common/middlewares/post-exists.middleware";
import { PostModel } from "src/entites/post.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsModel, PostModel]),
    CommonModule,
    AuthModule,
    UserModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddelware).forRoutes(CommentsController);
  }
}
