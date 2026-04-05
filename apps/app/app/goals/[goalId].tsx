import { useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { theme } from '../../lib/theme'

export default function GoalDetailScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>()
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>목표: {goalId}</Text>
      <Text style={styles.desc}>(상세 구현 예정)</Text>
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
  },
  title: {
    ...theme.font.headline,
    color: theme.color.textPrimary,
  },
  desc: {
    ...theme.font.body,
    color: theme.color.textSecondary,
    marginTop: theme.space.md,
  },
})
