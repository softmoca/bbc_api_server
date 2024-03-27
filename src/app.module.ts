import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { UsersModel } from "./entites/user.entity";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";
import { PostModel } from "./entites/post.entity";
import { AuthModule } from "./auth/auth.module";
import { PostsModule } from "./posts/posts.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { CommonModule } from "./common/common.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PUBLIC_FOLDER_PATH } from "./common/const/path.const";
import { ImageModel } from "./entites/image.entity";
import { ChatsModule } from "./chats/chats.module";
import { ChatsModel } from "./entites/chats.entity";
import { MessagesModel } from "./entites/messages.entity";
import { CommentsModule } from "./posts/comments/comments.module";
import { CommentsModel } from "./entites/comments.entity";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: "/public",
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: true,
      entities: [
        UsersModel,
        PostModel,
        ImageModel,
        ChatsModel,
        MessagesModel,
        CommentsModel,
      ],
      //logging: true,
      charset: "utf8mb4",
    }),
    UserModule,
    AuthModule,
    PostsModule,
    CommonModule,
    ChatsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
