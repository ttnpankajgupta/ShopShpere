import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getHealth } from '../api/client';
import { ApiClientError, ApiTimeoutError } from '../api/types';
import { Button, Card, ErrorState, Loader } from '../components';

export function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHealth();
      setHealthStatus(`${data.service}: ${data.status}`);
    } catch (err) {
      if (err instanceof ApiTimeoutError) {
        setError('Request timed out. Please try again.');
      } else if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to reach the server.');
      }
      setHealthStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>ShopSphere</Text>
      <Card>
        {error ? (
          <ErrorState message={error} onRetry={checkHealth} />
        ) : (
          <Text style={styles.status}>Backend health: {healthStatus}</Text>
        )}
        <Button title="Refresh health" onPress={checkHealth} style={styles.button} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f9fafb' },
  heading: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  status: { marginBottom: 12, fontSize: 16 },
  button: { marginTop: 8 },
});
