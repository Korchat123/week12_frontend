import DiaryDashboard from '../component/DiaryDashboard';

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Diary & Reminders</h1>
        <p className="mt-2 text-gray-500">Manage your diary entries, events, and reminder outcomes.</p>
      </div>
      <DiaryDashboard />
    </div>
  );
}
