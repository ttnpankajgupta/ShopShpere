import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

export function UnauthorizedPage() {
  return (
    <div className="centered">
      <Card>
        <h1>Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
        <Link to="/dashboard">Back to dashboard</Link>
      </Card>
    </div>
  );
}
