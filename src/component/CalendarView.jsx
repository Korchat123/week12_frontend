import React, { useState } from 'react';
import './Diary.css';

export default function CalendarView({ notes }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = new Date(year, month, d).toDateString();
    const hasNote = notes.some(n => {
      const noteDate = new Date(n.reminderDate || n.createdAt).toDateString();
      return noteDate === dateStr;
    });

    const isToday = new Date().toDateString() === dateStr;

    days.push(
      <div key={d} className={`calendar-day ${hasNote ? 'has-note' : ''} ${isToday ? 'today' : ''}`}>
        <span className="day-number">{d}</span>
        {hasNote && <div className="note-indicator"></div>}
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h3>{monthNames[month]} {year}</h3>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid">
        <div className="day-name">Sun</div>
        <div className="day-name">Mon</div>
        <div className="day-name">Tue</div>
        <div className="day-name">Wed</div>
        <div className="day-name">Thu</div>
        <div className="day-name">Fri</div>
        <div className="day-name">Sat</div>
        {days}
      </div>
    </div>
  );
}
