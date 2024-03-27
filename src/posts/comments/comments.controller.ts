import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { PaginateCommentsDto } from "./dto/paginate-comments.dto";
import { TransactionInterceptor } from "src/common/interceptor/transaction.interceptor";
import { CreateCommentsDto } from "./dto/create-comments.dto";
import { UsersModel } from "src/entites/user.entity";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { QueryRunnerDecorator } from "src/common/decorators/query-runner.decorator";
import { QueryRunner } from "typeorm";
import { PostsService } from "../posts.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { IsCommentMineOrAdminGuard } from "src/auth/guard/is-comment-mine-or-admin.guard";
import { UpdateCommentsDto } from "./dto/update-comments.dto";

@Controller("posts/:postId/comments")
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService
  ) {}

  @Get()
  getComments(
    @Param("postId", ParseIntPipe) postId: number,
    @Query() query: PaginateCommentsDto
  ) {
    return this.commentsService.paginteComments(query, postId);
  }

  @Get(":commentId")
  getComment(@Param("commentId", ParseIntPipe) commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @Param("postId", ParseIntPipe) postId: number,
    @Body() body: CreateCommentsDto,
    @CurrentUser() user: UsersModel,
    @QueryRunnerDecorator() qr: QueryRunner
  ) {
    const resp = await this.commentsService.createComment(
      body,
      postId,
      user,
      qr
    );

    await this.postsService.incrementCommentCount(postId, qr);

    return resp;
  }

  @Patch(":commentId")
  @UseGuards(IsCommentMineOrAdminGuard)
  async patchComment(
    @Param("commentId", ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentsDto
  ) {
    return this.commentsService.updateComment(body, commentId);
  }

  @Delete(":commentId")
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
    @Param("commentId", ParseIntPipe) commentId: number,
    @Param("postId", ParseIntPipe) postId: number,
    @QueryRunnerDecorator() qr: QueryRunner
  ) {
    const resp = await this.commentsService.deleteComment(commentId, qr);

    await this.postsService.decrementCommentCount(postId, qr);

    return resp;
  }
}
