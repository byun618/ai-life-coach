import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.35.7:3000';

export default function App() {
  const [message, setMessage] = useState<string>('(아직 안 불러옴)');
  const [loading, setLoading] = useState(false);

  const fetchHello = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/hello`);
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage(`에러: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Life Coach</Text>
      <Text style={styles.subtitle}>API: {API_URL}</Text>
      <Text style={styles.message}>{message}</Text>
      <Button
        title={loading ? '불러오는 중...' : 'Hello 불러오기'}
        onPress={fetchHello}
        disabled={loading}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  message: {
    fontSize: 18,
    color: '#3182F6',
    fontWeight: '600',
  },
});
