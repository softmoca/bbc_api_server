import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/createPost.dto";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { UsersModel } from "src/entites/user.entity";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { PaginatePostDto } from "./dto/paginte-post.dto";
import { TransactionInterceptor } from "src/common/interceptor/transaction.interceptor";
import { DataSource, QueryRunner } from "typeorm";
import { QueryRunnerDecorator } from "src/common/decorators/query-runner.decorator";
import { ImageModelType } from "src/entites/image.entity";
import { PostsImagesService } from "./image/images.service";
import { error } from "console";
import { LogInterceptor } from "src/common/interceptor/log.interceptor";
import { IsPostMineOrAdminGuard } from "src/auth/guard/is-post-mine-or-admin.guard";

@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService
  ) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Post()
  @UseInterceptors(LogInterceptor)
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AccessTokenGuard)
  async postPosts(
    @CurrentUser() user: UsersModel,
    @Body() body: CreatePostDto,
    @QueryRunnerDecorator() qr: QueryRunner
  ) {
    // 트랜잭션 로직 실행
    const post = await this.postsService.createPost(user.id, body, qr);

    for (let i = 0; i < body.images.length; i++) {
      await this.postsImagesService.createPostImage(
        {
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        },
        qr
      );
    }

    return this.postsService.getPostById(post.id, qr);
  }

  // @Post()
  // @UseGuards(AccessTokenGuard)
  // async createPost(
  //   @CurrentUser() user: UsersModel,
  //   @Body() createPostDto: CreatePostDto
  // ) {
  //   return this.postsService.createPost(user.id, createPostDto);
  // }

  @Patch(":postId")
  @UseGuards(IsPostMineOrAdminGuard)
  patchPost(
    @Param("postId", ParseIntPipe) id: number,
    @Body() body: UpdatePostDto
  ) {
    return this.postsService.updatePost(id, body);
  }
}
