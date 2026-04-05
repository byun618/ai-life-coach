import { API_URL, USER_ID } from './config'
import type {
  ChatRoom,
  GoalListItem,
  GoalDetail,
  Message,
  NudgeSettings,
  SyncStatus,
} from '@ai-life-coach/shared'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  // Chat
  getGlobalRoom: () =>
    request<{ room: ChatRoom }>(`/chat/rooms/global?userId=${USER_ID}`),

  getMessages: (roomId: string, cursor?: string, limit = 30) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set('cursor', cursor)
    return request<{ messages: Message[]; nextCursor: string | null }>(
      `/chat/rooms/${roomId}/messages?${params}`,
    )
  },

  sendMessage: (roomId: string, content: string) =>
    request<{ userMessage: Message }>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  streamUrl: (roomId: string, prompt: string) =>
    `${API_URL}/chat/rooms/${roomId}/stream?prompt=${encodeURIComponent(prompt)}`,

  abortStream: (roomId: string) =>
    request<{ ok: boolean }>(`/chat/rooms/${roomId}/abort`, { method: 'POST' }),

  // Goals
  getGoals: () => request<{ goals: GoalListItem[] }>('/goals'),
  getGoal: (id: string) => request<GoalDetail>(`/goals/${id}`),
  toggleSubTask: (goalId: string, subTaskId: string, completed: boolean) =>
    request<{ id: string; completed: boolean }>(
      `/goals/${goalId}/subtasks/${subTaskId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      },
    ),

  // Settings
  getNudgeSettings: () => request<NudgeSettings>('/settings/nudge'),
  updateNudgeSettings: (settings: Partial<NudgeSettings>) =>
    request<NudgeSettings>('/settings/nudge', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    }),

  // Sync
  getSyncStatus: () => request<SyncStatus>('/sync/status'),
  sync: () => request<{ syncedAt: string }>('/sync', { method: 'POST' }),
}
