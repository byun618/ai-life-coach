import { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import EventSource from 'react-native-sse'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { theme } from '../lib/theme'
import { api } from '../lib/api'
import { ChatBubble } from '../components/chat/ChatBubble'
import type { Message, Role } from '@ai-life-coach/shared'

interface StreamingMessage {
  id: string
  role: Role
  content: string
  streaming: boolean
}

export default function ChatScreen() {
  const qc = useQueryClient()
  const insets = useSafeAreaInsets()
  const listRef = useRef<FlatList>(null)
  const [input, setInput] = useState('')
  const [streamingMsg, setStreamingMsg] = useState<StreamingMessage | null>(null)
  const [sending, setSending] = useState(false)

  const roomQuery = useQuery({
    queryKey: ['chat-room'],
    queryFn: api.getGlobalRoom,
  })

  const roomId = roomQuery.data?.room.id

  const messagesQuery = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => api.getMessages(roomId!),
    enabled: !!roomId,
  })

  const messages: Message[] = messagesQuery.data?.messages ?? []

  const allMessages: StreamingMessage[] = [
    ...messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      streaming: false,
    })),
    ...(streamingMsg ? [streamingMsg] : []),
  ]

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }, [allMessages.length, streamingMsg?.content])

  const send = async () => {
    if (!input.trim() || !roomId || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    try {
      await api.sendMessage(roomId, content)
      await qc.invalidateQueries({ queryKey: ['messages', roomId] })

      const tempId = `streaming-${Date.now()}`
      setStreamingMsg({ id: tempId, role: 'ai', content: '', streaming: true })

      const es = new EventSource<'message.delta' | 'message.done' | 'message.error'>(
        api.streamUrl(roomId, content),
      )
      es.addEventListener('message.delta', (e) => {
        if (!e.data) return
        const data = JSON.parse(e.data) as { content: string }
        setStreamingMsg((prev) =>
          prev ? { ...prev, content: prev.content + data.content } : prev,
        )
      })
      es.addEventListener('message.done', async () => {
        es.close()
        setStreamingMsg(null)
        setSending(false)
        await qc.invalidateQueries({ queryKey: ['messages', roomId] })
      })
      es.addEventListener('message.error', (e) => {
        es.close()
        if (e.data) {
          const data = JSON.parse(e.data) as { message: string }
          setStreamingMsg((prev) =>
            prev
              ? { ...prev, content: `에러: ${data.message}`, streaming: false }
              : prev,
          )
        }
        setSending(false)
      })
      es.addEventListener('error', () => {
        es.close()
        setSending(false)
      })
    } catch (err) {
      setSending(false)
      setStreamingMsg(null)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : insets.top + 56}
    >
      <FlatList
        ref={listRef}
        data={allMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble role={item.role} content={item.content} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              무엇이든 던져보세요.{'\n'}목표를 만들거나, 오늘 한 일을 기록하거나.
            </Text>
          </View>
        }
      />
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + theme.space.md }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요"
          placeholderTextColor={theme.color.textTertiary}
          style={styles.input}
          multiline
          editable={!sending}
        />
        <Pressable
          onPress={send}
          disabled={!input.trim() || sending}
          style={({ pressed }) => [
            styles.sendBtn,
            (!input.trim() || sending) && styles.sendBtnDisabled,
            pressed && styles.sendBtnPressed,
          ]}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.bgBase,
  },
  listContent: {
    padding: theme.space.lg,
    paddingBottom: theme.space.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space.xl,
  },
  emptyText: {
    ...theme.font.body,
    color: theme.color.textTertiary,
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.space.md,
    gap: theme.space.sm,
    backgroundColor: theme.color.bgBase,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.bgElevated,
    color: theme.color.textPrimary,
    ...theme.font.callout,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: theme.color.bgElevated,
  },
  sendBtnPressed: {
    opacity: 0.8,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
})
