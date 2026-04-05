import { StyleSheet, Text, View } from 'react-native'
import { theme } from '../../lib/theme'

interface ChipProps {
  label: string
}

export function Chip({ label }: ChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.bgElevated,
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.font.label,
    color: theme.color.textSecondary,
  },
})
