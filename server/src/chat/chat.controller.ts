import {
  Body,
  Controller,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Post,
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
@UseGuards(AccessTokenGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly aiChatService: ChatService) {}

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
}
