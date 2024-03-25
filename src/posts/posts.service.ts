import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostModel } from "src/entites/post.entity";
import { FindOptionsWhere, LessThan, MoreThan, Repository } from "typeorm";
import { CreatePostDto } from "./dto/createPost.dto";
import { UpdatePostDto } from "./dto/updatePost.dto";
import { PaginatePostDto } from "./dto/paginte-post.dto";
import { ConfigService } from "@nestjs/config";
import { CommonService } from "src/common/common.service";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostModel)
    private readonly postsRepository: Repository<PostModel>,
    private readonly configService: ConfigService,
    private readonly commonService: CommonService
  ) {}

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      { relations: ["author"] },
      "posts"
    );
  }

  async createPost(authorId: number, createPostDto: CreatePostDto) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...createPostDto,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { postTitle, postContent } = postDto;

    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (postTitle) {
      post.postTitle = postTitle;
    }

    if (postContent) {
      post.postContent = postContent;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }
}
