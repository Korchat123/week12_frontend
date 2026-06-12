
const moodColors = {
  happy: '#F4C95D',
  excited: '#F59E6B',
  neutral: '#A7B0B8',
  sad: '#7DA9D8',
  angry: '#D98282'
};

const moodLabels = {
  happy: 'Bright',
  excited: 'Energized',
  neutral: 'Steady',
  sad: 'Low energy',
  angry: 'Tense'
};

export default function MoodPercentageBar({ notes = [] }) {
  const moodEntries = notes.filter(note => note.feeling && note.feeling !== 'unknown');
  const hasNotes = moodEntries.length > 0;
  const total = hasNotes ? moodEntries.length : 1;
  const counts = hasNotes
    ? moodEntries.reduce((acc, note) => {
        const mood = note.feeling;
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {})
    : {};

  const moods = Object.keys(moodLabels);

  return (
    <div className="mb-8 rounded-xl border border-[#e6ddd4] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
      <h3 className="text-xl font-bold text-[#24312f]">Mood Check-In</h3>
      {!hasNotes && (
        <p className="mt-2 text-sm text-[#66736f]">No mood entries yet. Add a private note when you want to reflect.</p>
      )}
      <div className="my-4 flex h-5 w-full overflow-hidden rounded-full bg-[#f1ebe4]">
        {moods.map(mood => {
          const count = counts[mood] || 0;
          const percentage = (count / total) * 100;
          if (percentage === 0) return null;

          return (
            <div
              key={mood}
              className="h-full transition-[width]"
              style={{
                width: `${percentage}%`,
                backgroundColor: moodColors[mood]
              }}
              title={`${moodLabels[mood]}: ${Math.round(percentage)}%`}
            />
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        {moods.map(mood => {
          const count = counts[mood] || 0;
          if (count === 0) return null;

          return (
            <div key={mood} className="flex items-center gap-2 text-sm text-[#53615d]">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: moodColors[mood] }}></span>
              <span>{moodLabels[mood]} ({Math.round((count / total) * 100)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
