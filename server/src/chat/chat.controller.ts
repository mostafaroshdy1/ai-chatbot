import {
  Body,
  Controller,
  Get,
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
@UseGuards(AccessTokenGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly aiChatService: ChatService) {}

  @Get()
  async getAllChats(
    @Query() data: { offset: number; limit: number },
  ): Promise<CreateChatDto[]> {
    const chats = await this.aiChatService.getAllChats(data);
    return plainToInstance(CreateChatDto, chats);
  }

  // creates a new chat
  @Post()
  async createChat(): Promise<CreateChatDto> {
    const chat = await this.aiChatService.createNewChat();
    return plainToInstance(CreateChatDto, chat);
  }

  @Post(':chatId')
  async addMessageToChat(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() data: PromptDto,
  ) {
    return this.aiChatService.AskMessageToChat(chatId, data.prompt, data.model);
  }

  @SetMetadata('sse', true)
  @Sse(':chatId/stream')
  streamChatMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Observable<MessageEvent> {
    return this.aiChatService.getStreamingObservable(chatId);
  }

  @Get(':chatId')
  async getChatMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
  ): Promise<ChatMessageDto[]> {
    const messages = await this.aiChatService.getChatMessages(chatId);
    return plainToInstance(ChatMessageDto, messages);
  }
}
