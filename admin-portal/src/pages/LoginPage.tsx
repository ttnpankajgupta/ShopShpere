import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, Input } from '../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid email');
      return;
    }
    login();
    navigate('/dashboard');
  };

  return (
    <div className="centered">
      <Card>
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit">Sign in</Button>
        </form>
      </Card>
    </div>
  );
}
