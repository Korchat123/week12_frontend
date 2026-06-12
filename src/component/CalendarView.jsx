import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiary } from '../context/DiaryContext';

const getEntryDate = (entry) => new Date(entry.reminderDate || entry.createdAt);
const isSameDay = (firstDate, secondDate) => firstDate.toDateString() === secondDate.toDateString();

const moodLabels = {
  happy: 'Bright',
  excited: 'Energized',
  neutral: 'Steady',
  sad: 'Low energy',
  angry: 'Tense',
  unknown: 'Not sure yet'
};

export default function CalendarView({ notes, onUpdateEvent, onDeleteEvent }) {
  const navigate = useNavigate();
  const { handleEditClick } = useDiary();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    const nextDate = new Date(year, month - 1, 1);
    setCurrentDate(nextDate);
    setSelectedDate(nextDate);
  };

  const nextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    setCurrentDate(nextDate);
    setSelectedDate(nextDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setIsPickerOpen(false);
  };

  const handleMonthChange = (nextMonthValue) => {
    const nextDate = new Date(year, Number(nextMonthValue), 1);
    setCurrentDate(nextDate);
    setSelectedDate(nextDate);
  };

  const handleYearChange = (nextYearValue) => {
    const nextDate = new Date(Number(nextYearValue), month, 1);
    setCurrentDate(nextDate);
    setSelectedDate(nextDate);
  };

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const selectedDayEntries = notes
    .filter(note => isSameDay(getEntryDate(note), selectedDate))
    .sort((a, b) => getEntryDate(a) - getEntryDate(b));

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square rounded-lg bg-transparent"></div>);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dayDate = new Date(year, month, d);
    const hasNote = notes.some(n => isSameDay(getEntryDate(n), dayDate));

    const isToday = isSameDay(new Date(), dayDate);
    const isSelected = isSameDay(selectedDate, dayDate);
    const dayClass = isSelected
      ? 'border-2 border-[var(--color-brand)] bg-[var(--color-brand)] font-bold text-white'
      : isToday
        ? 'border border-[var(--color-brand)] bg-[var(--color-brand-soft)] font-bold text-[var(--color-brand-strong)]'
        : hasNote
          ? 'bg-[var(--color-focus-soft)] hover:bg-orange-100'
          : 'bg-[var(--color-panel-muted)] hover:bg-white';

    days.push(
      <button
        key={d}
        type="button"
        onClick={() => {
          setSelectedDate(dayDate);
          setIsModalOpen(true);
        }}
        className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border text-sm transition ${dayClass}`}
        aria-label={`Show events for ${dayDate.toLocaleDateString()}`}
      >
        <span>{d}</span>
        {hasNote && <div className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[var(--color-focus)]'}`}></div>}
      </button>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const yearOptions = Array.from({ length: 21 }, (_, index) => new Date().getFullYear() - 10 + index);

  const handleNoticeToggle = async (entry) => {
    if (!onUpdateEvent) return;

    const nextEnabled = entry.noticeEnabled === false;
    await onUpdateEvent(entry._id, {
      noticeEnabled: nextEnabled,
      noticeAt: nextEnabled ? (entry.noticeAt || entry.reminderDate) : null,
      noticeSentAt: nextEnabled ? null : entry.noticeSentAt
    });
  };

  const handleDeleteEvent = async (entry) => {
    if (!onDeleteEvent) return;
    if (!window.confirm(`Delete "${entry.topic}"?`)) return;
    await onDeleteEvent(entry._id);
  };

  const handleEntryClick = (entry) => {
    handleEditClick(entry);
    setIsModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={prevMonth} className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-[var(--color-muted)] hover:bg-[var(--color-panel-muted)]">&lt;</button>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isPickerOpen ? (
            <>
              <select
                value={month}
                onChange={(event) => handleMonthChange(event.target.value)}
                className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-base font-semibold text-[var(--color-text)]"
                aria-label="Choose calendar month"
              >
                {monthNames.map((monthName, index) => (
                  <option key={monthName} value={index}>{monthName}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(event) => handleYearChange(event.target.value)}
                className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-base font-semibold text-[var(--color-text)]"
                aria-label="Choose calendar year"
              >
                {yearOptions.map(yearOption => (
                  <option key={yearOption} value={yearOption}>{yearOption}</option>
                ))}
              </select>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="cursor-pointer rounded-lg border-0 bg-transparent px-3 py-2 text-xl font-bold text-[var(--color-text)] hover:bg-[var(--color-panel-muted)]"
              aria-label="Choose calendar month and year"
            >
              {monthNames[month]} {year}
            </button>
          )}
          <button
            type="button"
            onClick={goToToday}
            className="cursor-pointer rounded-lg border border-sky-200 bg-[var(--color-brand-soft)] px-3 py-2 text-sm font-semibold text-[var(--color-brand-strong)] hover:bg-sky-100"
          >
            Today
          </button>
        </div>
        <button onClick={nextMonth} className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-[var(--color-muted)] hover:bg-[var(--color-panel-muted)]">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="pb-2 text-xs font-bold text-[var(--color-muted)]">{day}</div>
        ))}
        {days}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-sky-950/35 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl border border-[var(--color-border)] bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-[var(--color-text)]">
                  {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </h4>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {selectedDayEntries.length} {selectedDayEntries.length === 1 ? 'event' : 'events'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-full border-0 bg-[var(--color-panel-muted)] text-xl leading-none text-[var(--color-muted)] hover:bg-sky-100"
                aria-label="Close event popup"
              >
                x
              </button>
            </div>

            {selectedDayEntries.length > 0 ? (
              <div className="flex flex-col gap-3">
                {selectedDayEntries.map(entry => (
                  <div
                    key={entry._id}
                    className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-white p-4 transition hover:bg-[var(--color-panel-muted)]"
                    onClick={() => handleEntryClick(entry)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleEntryClick(entry);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="font-semibold text-[var(--color-text)]">{entry.topic}</h5>
                      <span className="shrink-0 text-xs font-semibold text-[var(--color-muted)]">
                        {getEntryDate(entry).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{entry.detail}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs text-[var(--color-muted)]">
                          {moodLabels[entry.feeling] || 'Not sure yet'}
                        </span>
                        <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs text-[var(--color-muted)]">
                          Event {getEntryDate(entry).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {entry.noticeEnabled !== false && (
                          <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs text-[var(--color-muted)]">
                            Remind {entry.noticeAt ? new Date(entry.noticeAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'event time'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleNoticeToggle(entry);
                          }}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-bold ${
                            entry.noticeEnabled !== false
                              ? 'border-sky-200 bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)] hover:bg-sky-100'
                              : 'border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-panel-muted)]'
                          }`}
                        >
                          Remind {entry.noticeEnabled !== false ? 'On' : 'Off'}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteEvent(entry);
                          }}
                          className="cursor-pointer rounded-full border border-[#efcfca] bg-white px-3 py-1 text-xs font-bold text-[#b05a5a] hover:bg-[#fff1ef]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-muted)] p-4 text-sm text-[var(--color-muted)]">No events for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
