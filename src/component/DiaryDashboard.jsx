import { useDiary } from '../context/DiaryContext';

const inputClass = 'w-full rounded-lg border border-[var(--color-border)] bg-white/90 p-2.5 text-sm text-[var(--color-text)] transition placeholder:text-sky-300 focus:border-[var(--color-brand)]';
const formInputClass = 'w-full rounded-lg border border-[var(--color-border)] bg-white/90 p-3 text-base text-[var(--color-text)] transition placeholder:text-sky-300 focus:border-[var(--color-brand)]';

const statusClasses = {
  'status-future': 'border-l-[var(--color-brand)] bg-[var(--color-brand-soft)]',
  'status-missing-feeling': 'border-l-[var(--color-focus)] bg-[var(--color-focus-soft)]'
};

const moodLabels = {
  happy: 'Bright',
  excited: 'Energized',
  neutral: 'Steady',
  sad: 'Low energy',
  angry: 'Tense',
  unknown: 'Not sure yet'
};

export default function DiaryDashboard() {
  const {
    editingId,
    formData,
    setFormData,
    statusMessage,
    errorMessage,
    searchQuery,
    setSearchQuery,
    filterDate,
    setFilterDate,
    filterFeeling,
    setFilterFeeling,
    statusFilter,
    setStatusFilter,
    entryTypeFilter,
    setEntryTypeFilter,
    handleSubmit,
    resetForm,
    handleDelete,
    handleEditClick,
    filteredNotes,
    getNoteStatusClass
  } = useDiary();

  const getHistoryClasses = (note) => {
    const statusClass = statusClasses[getNoteStatusClass(note)] || 'border-l-[var(--color-border)] bg-[var(--color-panel-muted)]';
    const editClass = editingId === note._id ? 'ring-2 ring-[var(--color-brand)] ring-offset-2 ring-offset-white' : '';
    return `relative cursor-pointer rounded-lg border border-transparent border-l-4 p-4 transition hover:border-[var(--color-border)] hover:bg-white ${statusClass} ${editClass}`;
  };

  return (
    <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-[350px_1fr] lg:gap-8">
      <div className="flex h-full flex-col gap-6 lg:sticky lg:top-8 lg:pb-6">
        <section className="rounded-xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
          <h3 className="text-xl font-bold text-[var(--color-text)]">Find Entries</h3>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Search topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={inputClass}
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={inputClass}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All time</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
            <select
              value={entryTypeFilter}
              onChange={(e) => setEntryTypeFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All entries</option>
              <option value="diary">Diary Entries</option>
              <option value="event">Event Reminders</option>
            </select>
            <select
              value={filterFeeling}
              onChange={(e) => setFilterFeeling(e.target.value)}
              className={inputClass}
            >
              <option value="">All moods</option>
              <option value="happy">Bright</option>
              <option value="excited">Energized</option>
              <option value="neutral">Steady</option>
              <option value="sad">Low energy</option>
              <option value="angry">Tense</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </section>

        <section className="flex max-h-[520px] min-h-0 flex-col rounded-xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-soft)] lg:max-h-[calc(100vh-300px)]">
          <h3 className="text-xl font-bold text-[var(--color-text)]">Journal History</h3>
          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2">
            {filteredNotes.map(n => {
              const isEventEntry = n.type === 'reminder' && n.reminderKind !== 'daily';

              return (
                <div
                  key={n._id}
                  className={getHistoryClasses(n)}
                  onClick={() => handleEditClick(n)}
                >
                  <span className="block text-xs text-[var(--color-muted)]">
                    {n.reminderDate ? new Date(n.reminderDate).toLocaleString() : new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  <p className="my-1 pr-7 font-semibold text-[var(--color-text)]">{n.topic}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block rounded-full bg-white/80 px-2 py-0.5 text-xs text-[var(--color-muted)]">
                      {moodLabels[n.feeling] || 'Not sure yet'}
                    </span>
                    <span className="inline-block rounded-full bg-[var(--color-brand-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-brand-strong)]">
                      {isEventEntry ? 'Event' : 'Diary'}
                    </span>
                  </div>
                  <button
                    className="absolute right-2 top-2 h-7 w-7 cursor-pointer rounded-full border-0 bg-white/70 text-base text-[#b05a5a] opacity-75 hover:bg-[#fff1ef] hover:opacity-100"
                    onClick={(e) => handleDelete(n._id, e)}
                    aria-label="Delete diary entry"
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">{editingId ? 'Edit Reflection' : 'New Reflection'}</h2>
            {editingId && (
              <button type="button" className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-panel-muted)]" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
          {statusMessage && <p className="rounded-lg bg-[var(--color-brand-soft)] p-3 text-sm text-[var(--color-brand-strong)]">{statusMessage}</p>}
          {errorMessage && <p className="rounded-lg bg-[#fff1ef] p-3 text-sm text-[#b05a5a]">{errorMessage}</p>}

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[var(--color-muted)]">Event Date & Time</label>
            <input
              type="datetime-local"
              value={formData.reminderDate}
              onChange={e => setFormData({
                ...formData,
                reminderDate: e.target.value,
                noticeAt: formData.noticeAt || e.target.value
              })}
              className={formInputClass}
            />
          </div>

          <label className="flex items-center gap-3 font-semibold text-[var(--color-muted)]">
            <input
              type="checkbox"
              checked={formData.noticeEnabled}
              onChange={e => setFormData({
                ...formData,
                noticeEnabled: e.target.checked,
                noticeAt: e.target.checked ? (formData.noticeAt || formData.reminderDate) : ''
              })}
              disabled={!formData.reminderDate}
              className="h-4 w-4"
            />
            Remind me
          </label>

          {formData.reminderDate && formData.noticeEnabled && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[var(--color-muted)]">Remind time</label>
              <input
                type="datetime-local"
                value={formData.noticeAt}
                onChange={e => setFormData({...formData, noticeAt: e.target.value})}
                className={formInputClass}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[var(--color-muted)]">Topic</label>
            <input
              value={formData.topic}
              onChange={e => setFormData({...formData, topic: e.target.value})}
              placeholder="What's the topic?"
              required
              className={formInputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[var(--color-muted)]">Notes</label>
            <textarea
              value={formData.detail}
              onChange={e => setFormData({...formData, detail: e.target.value})}
              placeholder="Write what you want to remember..."
              required
              className={`${formInputClass} min-h-32 resize-y`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[var(--color-muted)]">Mood check-in</label>
            <select
              value={formData.feeling}
              onChange={e => setFormData({...formData, feeling: e.target.value})}
              className={formInputClass}
            >
              <option value="unknown">Not sure yet</option>
              <option value="happy">Bright</option>
              <option value="excited">Energized</option>
              <option value="neutral">Steady</option>
              <option value="sad">Low energy</option>
              <option value="angry">Tense</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[var(--color-muted)]">Reflection</label>
            <textarea
              value={formData.result}
              onChange={e => setFormData({...formData, result: e.target.value})}
              placeholder="What happened, or what did you notice?"
              className={`${formInputClass} min-h-32 resize-y`}
            />
          </div>

          <button type="submit" className="cursor-pointer rounded-lg border-0 bg-[var(--color-brand)] p-4 font-bold text-white transition hover:bg-[var(--color-brand-strong)]">
            {editingId ? 'Update Reflection' : 'Save Reflection'}
          </button>
        </form>
      </div>
    </div>
  );
}
