import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostModel } from "src/entites/post.entity";
import { Repository } from "typeorm";
import { CreatePostDto } from "./dto/createPost.dto";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostModel)
    private readonly postsRepository: Repository<PostModel>
  ) {}

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
}
