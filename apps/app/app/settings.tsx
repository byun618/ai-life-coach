import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { theme } from '../lib/theme'
import { API_URL } from '../lib/config'

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>서버</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>API URL</Text>
            <Text style={styles.rowValue}>{API_URL}</Text>
          </View>
        </View>
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
    gap: theme.space.xl,
  },
  section: {
    gap: theme.space.md,
  },
  sectionLabel: {
    ...theme.font.label,
    color: theme.color.textSecondary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.color.bgSurface,
    borderRadius: theme.radius.md,
  },
  row: {
    padding: theme.space.lg,
    gap: theme.space.xs,
  },
  rowLabel: {
    ...theme.font.body,
    fontWeight: '500',
    color: theme.color.textPrimary,
  },
  rowValue: {
    ...theme.font.label,
    color: theme.color.textTertiary,
  },
})
