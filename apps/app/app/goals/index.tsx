import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { theme } from '../../lib/theme'

export default function GoalsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>아직 목표가 없어요</Text>
        <Text style={styles.emptyDesc}>
          채팅에서 "이직 준비 하고 싶어" 같은 목표를 던져보세요.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.bgBase,
  },
  content: {
    padding: theme.space.lg,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space.xxl,
    gap: theme.space.sm,
  },
  emptyTitle: {
    ...theme.font.headline,
    color: theme.color.textPrimary,
  },
  emptyDesc: {
    ...theme.font.body,
    color: theme.color.textSecondary,
    textAlign: 'center',
  },
})
