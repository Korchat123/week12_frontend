import { useAuth } from '../context/AuthContext';
import DiaryDashboard from '../component/DiaryDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p className="subtitle">Manage your diaries and reminders.</p>
      </div>
      <DiaryDashboard />
    </div>
  );
}
