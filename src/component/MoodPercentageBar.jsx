
const moodColors = {
  happy: '#ffcc00',
  excited: '#ff9900',
  neutral: '#cccccc',
  sad: '#6699ff',
  angry: '#ff3333'
};

const moodLabels = {
  happy: 'Happy',
  excited: 'Excited',
  neutral: 'Neutral',
  sad: 'Sad',
  angry: 'Angry'
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
    <div className="mb-8 rounded-2xl bg-white p-6 shadow">
      <h3 className="text-xl font-bold">Mood Distribution</h3>
      {!hasNotes && (
        <p className="mt-2 text-sm text-gray-500">No mood entries yet. Add a diary note to start tracking your mood.</p>
      )}
      <div className="my-4 flex h-6 w-full overflow-hidden rounded-full bg-gray-100">
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
            <div key={mood} className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: moodColors[mood] }}></span>
              <span>{moodLabels[mood]} ({Math.round((count / total) * 100)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
