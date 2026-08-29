import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

export function SessionExpiredPage() {
  return (
    <div className="centered">
      <Card>
        <h1>Session expired</h1>
        <p>Your admin session has ended. Sign in again to continue.</p>
        <Link to="/login">Go to login</Link>
      </Card>
    </div>
  );
}
