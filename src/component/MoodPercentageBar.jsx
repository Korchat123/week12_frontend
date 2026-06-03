import React from 'react';
import './Diary.css';

const moodColors = {
  happy: '#ffcc00',
  excited: '#ff9900',
  neutral: '#cccccc',
  sad: '#6699ff',
  angry: '#ff3333',
  unknown: '#e5e7eb'
};

const moodLabels = {
  happy: '😊 Happy',
  excited: '🤩 Excited',
  neutral: '😐 Neutral',
  sad: '😢 Sad',
  angry: '😡 Angry',
  unknown: '❓ Unknown'
};

export default function MoodPercentageBar({ notes }) {
  if (!notes || notes.length === 0) return null;

  const total = notes.length;
  const counts = notes.reduce((acc, note) => {
    const mood = note.feeling || 'unknown';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const moods = Object.keys(moodLabels);

  return (
    <div className="mood-container">
      <h3>Mood Distribution</h3>
      <div className="mood-bar">
        {moods.map(mood => {
          const count = counts[mood] || 0;
          const percentage = (count / total) * 100;
          if (percentage === 0) return null;

          return (
            <div
              key={mood}
              className="mood-bar-segment"
              style={{
                width: `${percentage}%`,
                backgroundColor: moodColors[mood]
              }}
              title={`${moodLabels[mood]}: ${Math.round(percentage)}%`}
            >
            </div>
          );
        })}
      </div>
      <div className="mood-legend">
        {moods.map(mood => {
          const count = counts[mood] || 0;
          if (count === 0) return null;
          return (
            <div key={mood} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: moodColors[mood] }}></span>
              <span className="legend-label">{moodLabels[mood]} ({Math.round((count / total) * 100)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
