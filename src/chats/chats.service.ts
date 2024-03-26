import { CommonService } from "src/common/common.service";
import { CreateChatDto } from "./dto/create-chat.dto";
import { PaginateChatDto } from "./dto/paginate-chat.dto";
import { Repository } from "typeorm";
import { ChatsModel } from "src/entites/chats.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService
  ) {}

  paginateChats(dto: PaginateChatDto) {
    return this.commonService.paginate(
      dto,
      this.chatsRepository,
      {
        relations: {
          users: true,
        },
      },
      "chats"
    );
  }

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      users: dto.userIds.map((id) => ({ id })),
    });

    return this.chatsRepository.findOne({
      where: {
        id: chat.id,
      },
    });
  }

  async checkIfChatExists(chatId: number) {
    const exists = await this.chatsRepository.exist({
      where: {
        id: chatId,
      },
    });

    return exists;
  }
}
