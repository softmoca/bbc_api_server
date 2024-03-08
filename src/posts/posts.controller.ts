import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/createPost.dto";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { CurrentUser } from "src/common/decorators/user.decorator";
import { UsersModel } from "src/entites/user.entity";
import { UpdatePostDto } from "./dto/updatePost.dto";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async createPost(
    @CurrentUser() user: UsersModel,
    @Body() createPostDto: CreatePostDto
  ) {
    return this.postsService.createPost(user.id, createPostDto);
  }

  @Patch(":id")
  updatePost(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto
  ) {
    console.log("dd");
    return this.postsService.updatePost(id, updatePostDto);
  }
}
