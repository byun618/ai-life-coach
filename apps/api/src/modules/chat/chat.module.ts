import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ClaudeCliService } from './claude-cli.service'

@Module({
  controllers: [ChatController],
  providers: [ChatService, ClaudeCliService],
})
export class ChatModule {}
