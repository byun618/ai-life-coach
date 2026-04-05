// ===== Enums =====
export type Role = 'user' | 'ai' | 'system'
export type ChatRoomType = 'global' | 'goal'

// ===== Entities (client-safe DTOs) =====
export interface User {
  id: string
  name: string
  createdAt: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface GoalListItem {
  id: string
  title: string
  tags: string[]
  recentRecord: {
    content: string
    recordedAt: string
  } | null
}

export interface GoalDetail extends Goal {
  subtasks: SubTask[]
  records: RecordItem[]
}

export interface SubTask {
  id: string
  goalId: string
  title: string
  completed: boolean
  order: number
}

export interface RecordItem {
  id: string
  goalId: string | null
  content: string
  recordedAt: string
}

export interface ChatRoom {
  id: string
  userId: string
  type: ChatRoomType
  goalId: string | null
  title: string
  lastMessageAt: string | null
  createdAt: string
}

export interface Message {
  id: string
  chatRoomId: string
  role: Role
  content: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface NudgeSettings {
  enabled: boolean
  maxPerDay: number
  timeStart: string
  timeEnd: string
}

export interface ScanFolder {
  name: string
  path: string
  summary: string
}

export interface ScanResult {
  scanId: string
  repoPath: string
  folders: ScanFolder[]
  scannedAt: string
}

export interface SyncStatus {
  repoPath: string
  connected: boolean
  lastSyncedAt: string | null
}

// ===== SSE Events =====
export type SideEffect =
  | { type: 'goal_created'; data: { goalId: string; title: string } }
  | { type: 'goal_updated'; data: { goalId: string } }
  | { type: 'subtask_created'; data: { subTaskId: string; goalId: string } }
  | { type: 'subtask_completed'; data: { subTaskId: string } }
  | { type: 'record_created'; data: { recordId: string; goalId: string } }

export type ChatStreamEvent =
  | { type: 'message.start'; data: { messageId: string } }
  | { type: 'message.delta'; data: { content: string } }
  | { type: 'message.done'; data: { messageId: string } }
  | { type: 'message.error'; data: { message: string } }
  | { type: 'side_effect'; data: SideEffect }

// ===== API DTOs =====
export interface SendMessageRequest {
  content: string
}

export interface SendMessageResponse {
  userMessage: Message
  streamToken: string
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
