import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ChatsService } from "./chats.service";
import { UserService } from "src/user/user.service";
import { AuthService } from "src/auth/auth.service";
import { ChatsMessagesService } from "./messages/messages.service";
import { UsersModel } from "src/entites/user.entity";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { SocketCatchHttpExceptionFilter } from "src/common/exception-filter/socket-catch-http.exception-filter";
import { EnterChatDto } from "./dto/enter-chat.dto";
import { CreateMessagesDto } from "./messages/dto/create-messages.dto";

@WebSocketGateway({
  namespace: "chats",
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: ChatsMessagesService,
    private readonly usersService: UserService,
    private readonly authService: AuthService
  ) {}

  @WebSocketServer()
  server: Server;
  afterInit(server: any) {
    console.log(`after gateway init`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`on disconnect called : ${socket.id}`);
  }

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called : ${socket.id}`);

    const headers = socket.handshake.headers;
    const rawToken = headers["authorization"];

    if (!rawToken) {
      console.log(
        `서버 : 토큰이 없는 에러로 인해 연결을 끊습니다. ${socket.id}`
      );
      socket.emit("exception", {
        data: "토큰이 없는 에러로 인해 연결을 끊습니다.",
      });
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (e) {
      console.log(
        `서버 : 소켓 통신시 에러 발생으로 인해 연결을 끊습니다 ${socket.id} `
      );
      socket.emit("exception", {
        data: "소켓 통신시 에러 발생으로 인해 연결을 끊습니다.",
      });

      socket.disconnect();
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage("create_chat")
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel }
  ) {
    console.log(socket.user);
    const chat = await this.chatsService.createChat(data);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage("enter_chat")
  async enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @ConnectedSocket() socket: Socket & { user: UsersModel },
    @MessageBody() data: EnterChatDto
  ) {
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);

      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat 입니다. chatId: ${chatId}`,
        });
      }
    }

    socket.join(data.chatIds.map((x) => x.toString()));
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage("send_message")
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel }
  ) {
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);

    if (!chatExists) {
      throw new WsException(
        `존재하지 않는 채팅방입니다. Chat ID : ${dto.chatId}`
      );
    }

    const message = await this.messagesService.createMessage(
      dto,
      socket.user.id
    );

    socket
      .to(message.chat.id.toString())
      .emit("receive_message", message.message);
  }
}
