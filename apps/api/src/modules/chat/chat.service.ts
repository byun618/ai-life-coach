import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/postgresql'
import { v4 } from 'uuid'
import { ChatRoom, ChatRoomType } from '../../entities/chat-room.entity'
import { Message, MessageRole } from '../../entities/message.entity'
import { User } from '../../entities/user.entity'

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name)

  constructor(private readonly em: EntityManager) {}

  async getOrCreateGlobalRoom(userId: string): Promise<ChatRoom> {
    const em = this.em.fork()
    let room = await em.findOne(ChatRoom, { user: userId, type: ChatRoomType.GLOBAL })
    if (room) return room

    const user = await em.findOne(User, { id: userId })
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`)
    }

    room = new ChatRoom(user, ChatRoomType.GLOBAL, '채팅')
    room.claudeSessionId = v4()
    await em.persistAndFlush(room)
    return room
  }

  async getMessages(roomId: string, limit = 30, cursor?: string) {
    const em = this.em.fork()
    const where: Record<string, unknown> = { chatRoom: roomId }
    if (cursor) {
      const cursorMessage = await em.findOne(Message, { id: cursor })
      if (cursorMessage) {
        where.createdAt = { $lt: cursorMessage.createdAt }
      }
    }
    const messages = await em.find(Message, where, {
      orderBy: { createdAt: 'DESC' },
      limit: limit + 1,
    })
    const hasMore = messages.length > limit
    const items = hasMore ? messages.slice(0, limit) : messages
    return {
      messages: items.reverse(),
      nextCursor: hasMore ? items[0].id : null,
    }
  }

  async saveUserMessage(roomId: string, content: string): Promise<Message> {
    const em = this.em.fork()
    const room = await em.findOne(ChatRoom, { id: roomId })
    if (!room) {
      throw new NotFoundException(`ChatRoom ${roomId} not found`)
    }
    const message = new Message(room, MessageRole.USER, content)
    room.lastMessageAt = new Date()
    await em.persistAndFlush(message)
    return message
  }

  async saveAiMessage(roomId: string, content: string): Promise<Message> {
    const em = this.em.fork()
    const room = await em.findOne(ChatRoom, { id: roomId })
    if (!room) {
      throw new NotFoundException(`ChatRoom ${roomId} not found`)
    }
    const message = new Message(room, MessageRole.AI, content)
    room.lastMessageAt = new Date()
    await em.persistAndFlush(message)
    return message
  }

  async getClaudeSession(
    roomId: string,
  ): Promise<{ sessionId: string; isResume: boolean }> {
    const em = this.em.fork()
    const room = await em.findOne(ChatRoom, { id: roomId })
    if (!room) {
      throw new NotFoundException(`ChatRoom ${roomId} not found`)
    }
    // Has any message been sent before? If no, create new; otherwise resume.
    const hasMessages = await em.count(Message, { chatRoom: roomId })
    if (!room.claudeSessionId) {
      room.claudeSessionId = v4()
      await em.persistAndFlush(room)
      return { sessionId: room.claudeSessionId, isResume: false }
    }
    // If claudeSessionId exists but no actual messages saved yet from AI, still first call.
    // We track 'has AI response been saved' by checking if there's any AI message.
    const aiMessageCount = await em.count(Message, {
      chatRoom: roomId,
      role: MessageRole.AI,
    })
    return {
      sessionId: room.claudeSessionId,
      isResume: aiMessageCount > 0,
    }
  }
}
