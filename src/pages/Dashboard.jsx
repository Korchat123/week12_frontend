import DiaryDashboard from '../component/DiaryDashboard';

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Diary & Reminders</h1>
        <p className="mt-2 text-[var(--color-muted)]">Manage private reflections, mood check-ins, and gentle reminders.</p>
      </div>
      <DiaryDashboard />
    </div>
  );
}
