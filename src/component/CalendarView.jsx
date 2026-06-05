import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiary } from '../context/DiaryContext';

const getEntryDate = (entry) => new Date(entry.reminderDate || entry.createdAt);
const isSameDay = (firstDate, secondDate) => firstDate.toDateString() === secondDate.toDateString();

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
      ? 'border-2 border-blue-600 bg-blue-600 font-bold text-white'
      : isToday
        ? 'border border-blue-500 bg-blue-50 font-bold'
        : hasNote
          ? 'bg-yellow-50 hover:bg-yellow-100'
          : 'bg-gray-50 hover:bg-gray-100';

    days.push(
      <button
        key={d}
        type="button"
        onClick={() => {
          setSelectedDate(dayDate);
          setIsModalOpen(true);
        }}
        className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-0 text-sm transition ${dayClass}`}
        aria-label={`Show events for ${dayDate.toLocaleDateString()}`}
      >
        <span>{d}</span>
        {hasNote && <div className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`}></div>}
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
    <div className="mb-8 rounded-2xl bg-white p-6 shadow">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={prevMonth} className="cursor-pointer rounded-lg border-0 bg-gray-100 px-4 py-2 hover:bg-gray-200">&lt;</button>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isPickerOpen ? (
            <>
              <select
                value={month}
                onChange={(event) => handleMonthChange(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold"
                aria-label="Choose calendar month"
              >
                {monthNames.map((monthName, index) => (
                  <option key={monthName} value={index}>{monthName}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(event) => handleYearChange(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold"
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
              className="cursor-pointer rounded-lg border-0 bg-transparent px-3 py-2 text-xl font-bold hover:bg-gray-100"
              aria-label="Choose calendar month and year"
            >
              {monthNames[month]} {year}
            </button>
          )}
          <button
            type="button"
            onClick={goToToday}
            className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            Today
          </button>
        </div>
        <button onClick={nextMonth} className="cursor-pointer rounded-lg border-0 bg-gray-100 px-4 py-2 hover:bg-gray-200">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="pb-2 text-xs font-bold text-gray-500">{day}</div>
        ))}
        {days}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedDayEntries.length} {selectedDayEntries.length === 1 ? 'event' : 'events'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-full border-0 bg-gray-100 text-xl leading-none text-gray-600 hover:bg-gray-200"
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
                    className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:bg-gray-100"
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
                      <h5 className="font-semibold text-gray-900">{entry.topic}</h5>
                      <span className="shrink-0 text-xs font-semibold text-gray-500">
                        {getEntryDate(entry).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{entry.detail}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">
                          {entry.feeling || 'unknown'}
                        </span>
                        <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">
                          Event {getEntryDate(entry).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">
                          Notice {entry.noticeAt ? new Date(entry.noticeAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'event time'}
                        </span>
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
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          Notice {entry.noticeEnabled !== false ? 'On' : 'Off'}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteEvent(entry);
                          }}
                          className="cursor-pointer rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">No events for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
