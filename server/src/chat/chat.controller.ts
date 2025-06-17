import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  SetMetadata,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { plainToInstance } from 'class-transformer';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { PromptDto } from './dto/prompt.dto';
import { Observable } from 'rxjs';
import { ChatMessageDto } from './dto/chat-messages.dto';
import { ChatDto } from './dto/chat.dto';
import { SharedChatDto } from './dto/shared-chat.dto';
@UseGuards(AccessTokenGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly aiChatService: ChatService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllChats(@Query() data: ChatDto): Promise<CreateChatDto[]> {
    const chats = await this.aiChatService.getAllChats(data);
    return plainToInstance(CreateChatDto, chats);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createChat(): Promise<CreateChatDto> {
    const chat = await this.aiChatService.createNewChat();
    return plainToInstance(CreateChatDto, chat);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':chatId')
  async addMessageToChat(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() data: PromptDto,
  ) {
    return this.aiChatService.AskMessageToChat(
      chatId,
      data.prompt,
      data.aiModelId,
    );
  }

  @HttpCode(HttpStatus.OK)
  @SetMetadata('sse', true)
  @Sse(':chatId/stream')
  streamChatMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Observable<MessageEvent> {
    return this.aiChatService.getStreamingObservable(chatId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':chatId')
  async getChatMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Promise<ChatMessageDto[]> {
    const messages = await this.aiChatService.getChatMessages(chatId);
    return plainToInstance(ChatMessageDto, messages);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('share/:chatId')
  async shareChat(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Promise<SharedChatDto> {
    const sharedChat = await this.aiChatService.createShareableChat(chatId);

    return plainToInstance(SharedChatDto, {
      sharedChatId: sharedChat,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('share/:sharedChatId')
  async getSharedChatById(
    @Param('sharedChatId', ParseUUIDPipe) chatId: string,
  ) {
    return this.aiChatService.getSharedChatById(chatId);
  }
}
