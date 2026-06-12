import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDiary } from '../context/DiaryContext';
import CalendarView from '../component/CalendarView';
import MoodPercentageBar from '../component/MoodPercentageBar';
import { formatLocalDateTime, getUserTimeZone, localDateTimeToIso } from '../utils/dateTime';

const sampleMoodNotes = [
  { _id: 'sample-happy', feeling: 'happy' },
  { _id: 'sample-excited', feeling: 'excited' },
  { _id: 'sample-neutral', feeling: 'neutral' },
  { _id: 'sample-sad', feeling: 'sad' },
  { _id: 'sample-happy-2', feeling: 'happy' }
];

const proximityClasses = {
  'prox-red': 'border-[var(--color-focus)] bg-[var(--color-focus-soft)]',
  'prox-yellow': 'border-[var(--color-focus)] bg-[var(--color-focus-soft)]',
  'prox-gray': 'border-sky-200 bg-[var(--color-panel-muted)]'
};

const repeatFrequencyOptions = [
  { value: 'always', label: 'Always' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' }
];

const repeatFrequencyLabels = repeatFrequencyOptions.reduce((labels, option) => ({
  ...labels,
  [option.value]: option.label
}), {});

const weekdayOptions = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

const dayPresets = {
  weekdays: [1, 2, 3, 4, 5],
  weekend: [0, 6]
};

const getReminderGroupKey = (reminder) => {
  const reminderDate = new Date(reminder.reminderDate);
  const noticeDate = reminder.noticeAt ? new Date(reminder.noticeAt) : null;
  const eventTime = reminderDate.toTimeString().slice(0, 5);
  const noticeTime = noticeDate ? noticeDate.toTimeString().slice(0, 5) : '';

  return [
    reminder.topic?.trim().toLowerCase(),
    reminder.detail?.trim().toLowerCase(),
    eventTime,
    noticeTime
  ].join('|');
};

const isDailyReminder = (reminder, legacyDailyReminderKeys) => (
  reminder.reminderKind === 'daily' ||
  reminder.detail?.includes('[Daily reminder]') ||
  (!reminder.reminderKind && legacyDailyReminderKeys.has(getReminderGroupKey(reminder)))
);

const getNextRepeatingDate = (noticeTime, repeatDays) => {
  const now = new Date();
  const [hours, minutes] = noticeTime.split(':').map(Number);

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setHours(hours, minutes, 0, 0);
    date.setDate(date.getDate() + index);

    return date;
  }).find(date => date > now && repeatDays.includes(date.getDay()));
};

const getReminderDetail = (detail = '') => detail.replace('[Daily reminder]', '').trim();

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notes, createNote, updateNote, runReminderAction, deleteNote, handleEditClick } = useDiary();
  const [eventForm, setEventForm] = useState({
    topic: '',
    detail: '',
    noticeTime: '08:30',
    repeatFrequency: 'always',
    repeatDays: dayPresets.weekdays,
    noticeEnabled: true
  });
  const [eventStatus, setEventStatus] = useState('');
  const reminders = useMemo(() => {
    const now = new Date();
    return notes
      .filter(n => n.reminderDate && new Date(n.reminderDate) > now)
      .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
  }, [notes]);
  const legacyDailyReminderKeys = useMemo(() => {
    const counts = reminders.reduce((acc, reminder) => {
      if (reminder.reminderKind) return acc;
      const key = getReminderGroupKey(reminder);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return new Set(
      Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([key]) => key)
    );
  }, [reminders]);
  const dailyReminders = useMemo(
    () => reminders.filter(reminder => isDailyReminder(reminder, legacyDailyReminderKeys)),
    [legacyDailyReminderKeys, reminders]
  );
  const eventReminders = useMemo(
    () => reminders.filter(reminder => !isDailyReminder(reminder, legacyDailyReminderKeys)),
    [legacyDailyReminderKeys, reminders]
  );

  const getProximityClass = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours <= 24) return proximityClasses['prox-red'];
    if (diffHours <= 72) return proximityClasses['prox-yellow'];
    return proximityClasses['prox-gray'];
  };

  const handleEventFormChange = (field, value) => {
    setEventForm(current => ({ ...current, [field]: value }));
  };

  const toggleRepeatDay = (day) => {
    setEventForm(current => {
      const hasDay = current.repeatDays.includes(day);
      const repeatDays = hasDay
        ? current.repeatDays.filter(item => item !== day)
        : [...current.repeatDays, day].sort((first, second) => first - second);

      return { ...current, repeatDays };
    });
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setEventStatus('');

    try {
      if (eventForm.repeatDays.length === 0) {
        setEventStatus('Choose at least one day.');
        return;
      }

      const nextReminderDate = getNextRepeatingDate(eventForm.noticeTime, eventForm.repeatDays);

      if (!nextReminderDate) {
        setEventStatus('Choose a future notice time.');
        return;
      }

      await createNote({
        topic: eventForm.topic,
        detail: eventForm.detail.trim() ? `[Daily reminder] ${eventForm.detail.trim()}` : '[Daily reminder]',
        feeling: 'unknown',
        type: 'reminder',
        reminderKind: 'daily',
        repeatFrequency: eventForm.repeatFrequency,
        repeatDays: eventForm.repeatDays,
        reminderDate: localDateTimeToIso(formatLocalDateTime(nextReminderDate)),
        noticeEnabled: eventForm.noticeEnabled,
        noticeAt: localDateTimeToIso(formatLocalDateTime(nextReminderDate)),
        userTimeZone: getUserTimeZone()
      });

      setEventForm(current => ({
        ...current,
        topic: '',
        detail: '',
        noticeEnabled: true
      }));
      setEventStatus('Repeating reminder created.');
    } catch (error) {
      console.error('Failed to create home event', error);
      setEventStatus('Could not create event. Please try again.');
    }
  };

  const handleReminderNoticeToggle = async (reminder) => {
    const nextEnabled = reminder.noticeEnabled === false;
    await updateNote(reminder._id, {
      noticeEnabled: nextEnabled,
      noticeAt: nextEnabled ? (reminder.noticeAt || reminder.reminderDate) : null,
      noticeSentAt: nextEnabled ? null : reminder.noticeSentAt
    });
  };

  const handleReminderAction = async (reminder, action) => {
    await runReminderAction(reminder._id, action);
  };

  const handleDeleteReminder = async (reminder) => {
    if (!window.confirm(`Delete "${reminder.topic}"?`)) return;
    await deleteNote(reminder._id);
  };

  const handleReminderClick = (reminder) => {
    handleEditClick(reminder);
    navigate('/dashboard');
  };

  const renderReminderList = (items, emptyMessage) => (
    items.length > 0 ? (
      <div className="grid max-h-96 grid-cols-1 gap-4 overflow-y-auto pr-2">
        {items.map(r => (
          <div
            key={r._id}
            onClick={() => handleReminderClick(r)}
            className={`flex flex-col gap-2 rounded-xl border border-[var(--color-border)] border-t-4 p-5 text-inherit shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${getProximityClass(r.reminderDate)}`}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleReminderClick(r);
              }
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[var(--color-muted)]">{new Date(r.reminderDate).toLocaleDateString()}</span>
              {r.reminderKind === 'daily' && (
                <span className="rounded-full bg-[var(--color-brand-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-brand-strong)]">
                  {repeatFrequencyLabels[r.repeatFrequency] || 'Always'}
                </span>
              )}
            </div>
            <h4 className="text-lg font-semibold text-[var(--color-text)]">{r.topic}</h4>
            {getReminderDetail(r.detail) && (
              <p className="text-sm text-[var(--color-muted)]">
                {getReminderDetail(r.detail).substring(0, 100)}{getReminderDetail(r.detail).length > 100 ? '...' : ''}
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-sm font-semibold text-[var(--color-muted)]">
                <span>Event {new Date(r.reminderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {r.noticeEnabled !== false && (
                  <span className="ml-3 text-[var(--color-muted)]">
                    Remind {r.noticeAt ? new Date(r.noticeAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'event time'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleReminderNoticeToggle(r);
                  }}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-bold ${
                    r.noticeEnabled !== false
                      ? 'border-sky-200 bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)] hover:bg-sky-100'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-panel-muted)]'
                  }`}
                >
                  Remind {r.noticeEnabled !== false ? 'On' : 'Off'}
                </button>
                {r.reminderKind === 'daily' && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleReminderAction(r, 'pause-once');
                    }}
                    className="cursor-pointer rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-bold text-orange-700 hover:bg-[var(--color-focus-soft)]"
                  >
                    Skip once
                  </button>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleReminderAction(r, 'stop-always');
                  }}
                  className="cursor-pointer rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-bold text-[var(--color-muted)] hover:bg-[var(--color-panel-muted)]"
                >
                  Turn off
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteReminder(r);
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
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-muted)] p-4">
        <p className="text-sm text-[var(--color-muted)]">{emptyMessage}</p>
      </div>
    )
  );

  const dailyReminderForm = (
    <section className="rounded-xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
      <h3 className="mb-2 text-2xl font-bold text-[var(--color-text)]">Create Reminder</h3>
      <p className="mb-4 text-sm text-[var(--color-muted)]">Choose a time and rhythm that supports your day.</p>
      <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
        <input
          value={eventForm.topic}
          onChange={(event) => handleEventFormChange('topic', event.target.value)}
          placeholder="Reminder title"
          required
          className="rounded-lg border border-[var(--color-border)] bg-white/90 p-3 text-[var(--color-text)] focus:border-[var(--color-brand)]"
        />

        <textarea
          value={eventForm.detail}
          onChange={(event) => handleEventFormChange('detail', event.target.value)}
          placeholder="Notes (optional)"
          className="min-h-24 resize-y rounded-lg border border-[var(--color-border)] bg-white/90 p-3 text-[var(--color-text)] focus:border-[var(--color-brand)]"
        />

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-muted)] p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--color-muted)]">Days</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleEventFormChange('repeatDays', dayPresets.weekdays)} className="cursor-pointer rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-muted)] hover:bg-sky-50">Weekdays</button>
              <button type="button" onClick={() => handleEventFormChange('repeatDays', dayPresets.weekend)} className="cursor-pointer rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-muted)] hover:bg-sky-50">Weekend</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekdayOptions.map(day => {
              const isSelected = eventForm.repeatDays.includes(day.value);

              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleRepeatDay(day.value)}
                  className={`cursor-pointer rounded-lg border px-2 py-2 text-xs font-bold ${
                    isSelected
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-sky-50'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 ${eventForm.noticeEnabled ? 'sm:grid-cols-2' : ''}`}>
          <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-muted)]">
            Repeat
            <select
              value={eventForm.repeatFrequency}
              onChange={(event) => handleEventFormChange('repeatFrequency', event.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-white/90 p-3 font-normal text-[var(--color-text)] focus:border-[var(--color-brand)]"
            >
              {repeatFrequencyOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          {eventForm.noticeEnabled && (
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--color-muted)]">
              Remind time
              <input
                type="time"
                value={eventForm.noticeTime}
                onChange={(event) => handleEventFormChange('noticeTime', event.target.value)}
                className="rounded-lg border border-[var(--color-border)] bg-white/90 p-3 font-normal text-[var(--color-text)] focus:border-[var(--color-brand)]"
              />
            </label>
          )}
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={eventForm.noticeEnabled}
            onChange={(event) => handleEventFormChange('noticeEnabled', event.target.checked)}
            className="h-4 w-4"
          />
          Remind me
        </label>

        <button type="submit" className="cursor-pointer rounded-lg border-0 bg-[var(--color-brand)] p-3 font-bold text-white hover:bg-[var(--color-brand-strong)]">
          Create Reminder
        </button>
        {eventStatus && <p className="text-sm text-[var(--color-muted)]">{eventStatus}</p>}
      </form>
    </section>
  );

  if (!user) {
    return (
      <div className="px-4 py-8 text-center md:px-8 md:py-14">
        <header>
          <h1 className="mb-4 text-4xl font-bold text-[var(--color-text)] md:text-5xl">Remide Mood</h1>
          <p className="mx-auto max-w-2xl text-[var(--color-muted)]">A private place for mood check-ins, reflections, and gentle reminders.</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/login" className="w-full rounded-lg bg-[var(--color-brand)] px-8 py-3 font-bold text-white no-underline hover:bg-[var(--color-brand-strong)] sm:w-auto">Login</Link>
            <Link to="/register" className="w-full rounded-lg border border-[var(--color-brand)] bg-white/70 px-8 py-3 font-bold text-[var(--color-brand)] no-underline hover:bg-[var(--color-brand-soft)] sm:w-auto">Get Started</Link>
          </div>
        </header>

        <section className="mt-12 text-left">
          <MoodPercentageBar notes={sampleMoodNotes} />
        </section>

        <section className="mt-12 md:mt-20">
          <h3 className="text-2xl font-bold text-[var(--color-text)]">Example Reminders</h3>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-xl border border-orange-200 border-t-4 bg-[var(--color-focus-soft)] p-6 text-left shadow-sm transition hover:-translate-y-0.5">
              <span className="text-xs font-bold tracking-wider text-[var(--color-muted)]">TOMORROW</span>
              <h4 className="text-xl font-semibold text-[var(--color-text)]">Check In With Yourself</h4>
              <p className="text-sm text-[var(--color-muted)]">Take a moment to write what feels important.</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-orange-200 border-t-4 bg-[var(--color-focus-soft)] p-6 text-left shadow-sm transition hover:-translate-y-0.5">
              <span className="text-xs font-bold tracking-wider text-[var(--color-muted)]">IN 3 DAYS</span>
              <h4 className="text-xl font-semibold text-[var(--color-text)]">Prepare for Appointment</h4>
              <p className="text-sm text-[var(--color-muted)]">Bring notes and questions you want to remember.</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] border-t-4 bg-[var(--color-panel-muted)] p-6 text-left shadow-sm transition hover:-translate-y-0.5">
              <span className="text-xs font-bold tracking-wider text-[var(--color-muted)]">NEXT WEEK</span>
              <h4 className="text-xl font-semibold text-[var(--color-text)]">Small Care Task</h4>
              <p className="text-sm text-[var(--color-muted)]">Make space for one practical thing that helps your week.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Hello, {user.name || user.username}</h1>
        <p className="mt-2 text-[var(--color-muted)]">Your private reflections and reminders at a glance.</p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="min-w-0">
          <MoodPercentageBar notes={notes} />

          {dailyReminderForm}

        </div>

        <div className="min-w-0">
          <CalendarView notes={notes} onUpdateEvent={updateNote} onDeleteEvent={deleteNote} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
          <h3 className="mb-4 text-2xl font-bold text-[var(--color-text)]">Repeating Reminders</h3>
          {renderReminderList(dailyReminders, 'No upcoming repeating reminders.')}
        </section>

        <section className="rounded-xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
          <h3 className="mb-4 text-2xl font-bold text-[var(--color-text)]">Event Reminders</h3>
          {renderReminderList(eventReminders, 'No upcoming event reminders.')}
        </section>
      </div>
    </div>
  );
}
