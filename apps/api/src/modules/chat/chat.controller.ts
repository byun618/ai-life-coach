import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Query,
  Sse,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { ChatService } from './chat.service'
import { ClaudeCliService } from './claude-cli.service'

interface SendMessageBody {
  content: string
}

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly claudeCli: ClaudeCliService,
  ) {}

  @Get('rooms/global')
  async getGlobalRoom(@Query('userId') userId: string) {
    const room = await this.chatService.getOrCreateGlobalRoom(userId)
    return { room }
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(
      roomId,
      limit ? Number(limit) : 30,
      cursor,
    )
  }

  @Post('rooms/:roomId/messages')
  async sendMessage(
    @Param('roomId') roomId: string,
    @Body() body: SendMessageBody,
  ) {
    const userMessage = await this.chatService.saveUserMessage(
      roomId,
      body.content,
    )
    return { userMessage }
  }

  @Sse('rooms/:roomId/stream')
  stream(
    @Param('roomId') roomId: string,
    @Query('prompt') prompt: string,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      let aborted = false
      ;(async () => {
        try {
          const sessionId = await this.chatService.getClaudeSessionId(roomId)
          let fullText = ''

          subscriber.next({
            type: 'message.start',
            data: { sessionId },
          })

          for await (const event of this.claudeCli.stream({
            prompt,
            sessionId,
          })) {
            if (aborted) break
            if (event.type === 'delta') {
              fullText += event.text
              subscriber.next({
                type: 'message.delta',
                data: { content: event.text },
              })
            } else if (event.type === 'error') {
              subscriber.next({
                type: 'message.error',
                data: { message: event.message },
              })
              subscriber.complete()
              return
            }
          }

          if (!aborted) {
            const aiMessage = await this.chatService.saveAiMessage(
              roomId,
              fullText,
            )
            subscriber.next({
              type: 'message.done',
              data: { messageId: aiMessage.id },
            })
          }
          subscriber.complete()
        } catch (err) {
          subscriber.next({
            type: 'message.error',
            data: { message: String(err) },
          })
          subscriber.complete()
        }
      })()

      return () => {
        aborted = true
      }
    })
  }

  @Post('rooms/:roomId/abort')
  async abort(@Param('roomId') roomId: string) {
    const sessionId = await this.chatService.getClaudeSessionId(roomId)
    const ok = this.claudeCli.abort(sessionId)
    return { ok }
  }
}
