import { useEffect, useState } from 'react';
import { getHealth } from '../api/client';
import { ApiClientError, ApiTimeoutError } from '../api/types';
import { Button, Card } from '../components/ui';

export function DashboardPage() {
  const [status, setStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  const loadHealth = async () => {
    setError(null);
    setStatus('Checking...');
    try {
      const data = await getHealth();
      setStatus(`${data.service}: ${data.status}`);
    } catch (err) {
      if (err instanceof ApiTimeoutError) {
        setError('API timeout');
      } else if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to reach API');
      }
      setStatus('Unavailable');
    }
  };

  useEffect(() => {
    void loadHealth();
  }, []);

  return (
    <Card>
      <h2>Dashboard</h2>
      <p>Backend health: {status}</p>
      {error ? <p className="error">{error}</p> : null}
      <Button onClick={() => void loadHealth()}>Refresh</Button>
    </Card>
  );
}
