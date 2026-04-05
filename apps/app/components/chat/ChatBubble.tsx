import { StyleSheet, Text, View } from 'react-native'
import { theme } from '../../lib/theme'
import type { Role } from '@ai-life-coach/shared'

interface ChatBubbleProps {
  role: Role
  content: string
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user'
  return (
    <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
      <View style={[styles.bubble, isUser ? styles.user : styles.ai]}>
        <Text style={[styles.text, isUser && styles.userText]}>{content}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: theme.space.md,
  },
  rowStart: {
    justifyContent: 'flex-start',
  },
  rowEnd: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: 290,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.lg - 2,
    borderRadius: theme.radius.lg,
  },
  ai: {
    backgroundColor: theme.color.bgSurface,
  },
  user: {
    backgroundColor: theme.color.accent,
  },
  text: {
    ...theme.font.callout,
    color: theme.color.textPrimary,
  },
  userText: {
    color: '#FFFFFF',
  },
})
