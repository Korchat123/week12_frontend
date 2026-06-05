import { useDiary } from '../context/DiaryContext';

const inputClass = 'w-full rounded-md border border-gray-300 p-2 text-sm';
const formInputClass = 'w-full rounded-lg border-2 border-gray-300 p-3 text-base';

const statusClasses = {
  'status-future': 'border-l-blue-500 bg-blue-50',
  'status-missing-feeling': 'border-l-amber-500 bg-amber-50'
};

export default function DiaryDashboard() {
  const {
    editingId,
    formData,
    setFormData,
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
    const statusClass = statusClasses[getNoteStatusClass(note)] || 'border-l-gray-300 bg-gray-50';
    const editClass = editingId === note._id ? 'border-2 border-blue-600 bg-blue-50' : '';
    return `relative cursor-pointer rounded-lg border-l-4 p-4 transition hover:translate-x-1 hover:bg-gray-100 ${statusClass} ${editClass}`;
  };

  return (
    <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-[350px_1fr] lg:gap-8">
      <div className="flex h-full flex-col gap-6 lg:sticky lg:top-8 lg:pb-6">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-xl font-bold">Search & Filters</h3>
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
              <option value="all">All Time</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
            <select
              value={entryTypeFilter}
              onChange={(e) => setEntryTypeFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All Events</option>
              <option value="diary">Diary Entries</option>
              <option value="event">Event Reminders</option>
            </select>
            <select
              value={filterFeeling}
              onChange={(e) => setFilterFeeling(e.target.value)}
              className={inputClass}
            >
              <option value="">All Moods</option>
              <option value="happy">Happy</option>
              <option value="excited">Excited</option>
              <option value="neutral">Neutral</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </section>

        <section className="flex max-h-[520px] min-h-0 flex-col rounded-2xl bg-white p-6 shadow lg:max-h-[calc(100vh-300px)]">
          <h3 className="text-xl font-bold">History (Click to Edit)</h3>
          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2">
            {filteredNotes.map(n => {
              const isEventEntry = n.type === 'reminder' && n.reminderKind !== 'daily';

              return (
                <div
                  key={n._id}
                  className={getHistoryClasses(n)}
                  onClick={() => handleEditClick(n)}
                >
                  <span className="block text-xs text-gray-500">
                    {n.reminderDate ? new Date(n.reminderDate).toLocaleString() : new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  <p className="my-1 font-semibold text-gray-900">{n.topic}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                      {n.feeling === 'unknown' ? 'Unknown' : n.feeling}
                    </span>
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {isEventEntry ? 'Event' : 'Diary'}
                    </span>
                  </div>
                  <button
                    className="absolute right-2 top-2 cursor-pointer border-0 bg-transparent text-xl text-red-500 opacity-60 hover:opacity-100"
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

      <div className="rounded-2xl bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">{editingId ? 'Edit Diary Entry' : 'New Diary Entry'}</h2>
            {editingId && (
              <button type="button" className="cursor-pointer rounded-md border-0 bg-gray-400 px-4 py-2 text-sm text-white hover:bg-gray-500" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Date & Time (Reminder)</label>
            <input
              type="datetime-local"
              value={formData.reminderDate}
              onChange={e => setFormData({...formData, reminderDate: e.target.value})}
              className={formInputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Topic</label>
            <input
              value={formData.topic}
              onChange={e => setFormData({...formData, topic: e.target.value})}
              placeholder="What's the topic?"
              required
              className={formInputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Detail</label>
            <textarea
              value={formData.detail}
              onChange={e => setFormData({...formData, detail: e.target.value})}
              placeholder="Describe your plan or day..."
              required
              className={`${formInputClass} min-h-32 resize-y`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">How do you feel about it? (Mood)</label>
            <select
              value={formData.feeling}
              onChange={e => setFormData({...formData, feeling: e.target.value})}
              className={formInputClass}
            >
              <option value="unknown">Unknown / Haven't Done</option>
              <option value="happy">Happy</option>
              <option value="excited">Excited</option>
              <option value="neutral">Neutral</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Result of Event</label>
            <textarea
              value={formData.result}
              onChange={e => setFormData({...formData, result: e.target.value})}
              placeholder="What was the outcome? (Fill this after the event)"
              className={`${formInputClass} min-h-32 resize-y`}
            />
          </div>

          <button type="submit" className="cursor-pointer rounded-lg border-0 bg-blue-600 p-4 font-bold text-white transition hover:bg-blue-700">
            {editingId ? 'Update Entry' : 'Save Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
