import { BasePaginationDto } from "src/common/dto/base-pagination.dto";
import { MessagesModel } from "src/entites/messages.entity";
import { FindManyOptions, Repository } from "typeorm";
import { CreateMessagesDto } from "./dto/create-messages.dto";
import { CommonService } from "src/common/common.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService
  ) {}

  async createMessage(dto: CreateMessagesDto, authorId: number) {
    const message = await this.messagesRepository.save({
      chat: {
        id: dto.chatId,
      },
      author: {
        id: authorId,
      },
      message: dto.message,
    });

    return this.messagesRepository.findOne({
      where: {
        id: message.id,
      },
      relations: {
        chat: true,
      },
    });
  }

  paginteMessages(
    dto: BasePaginationDto,
    overrideFindOptions: FindManyOptions<MessagesModel>
  ) {
    return this.commonService.paginate(
      dto,
      this.messagesRepository,
      overrideFindOptions,
      "messages"
    );
  }
}
