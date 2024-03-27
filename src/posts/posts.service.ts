import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostModel } from "src/entites/post.entity";
import {
  FindOptionsWhere,
  LessThan,
  MoreThan,
  QueryRunner,
  Repository,
} from "typeorm";
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

  async getPostById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const post = await repository.findOne({
      relations: {
        author: true,
        images: true,
      },
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      { relations: ["author"] },
      "posts"
    );
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<PostModel>(PostModel)
      : this.postsRepository;
  }

  async createPost(
    authorId: number,
    createPostDto: CreatePostDto,
    qr?: QueryRunner
  ) {
    const repository = this.getRepository(qr);

    const post = repository.create({
      author: {
        id: authorId,
      },
      ...createPostDto,
      images: [],
      postLike: 0,
    });

    const newPost = await repository.save(post);

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

  async checkPostExistsById(id: number) {
    return this.postsRepository.exists({
      where: {
        id,
      },
    });
  }

  async isPostMine(userId: number, postId: number) {
    return this.postsRepository.exists({
      where: {
        id: postId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }

  async incrementCommentCount(postId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.increment(
      {
        id: postId,
      },
      "commentCount",
      1
    );
  }

  async decrementCommentCount(postId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.decrement(
      {
        id: postId,
      },
      "commentCount",
      1
    );
  }
}
