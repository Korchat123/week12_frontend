import { useDiary } from '../context/DiaryContext';
import './Diary.css';

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
    handleSubmit,
    resetForm,
    handleDelete,
    handleEditClick,
    filteredNotes,
    getNoteStatusClass
  } = useDiary();

  return (
    <div className="diary-dashboard">
      <div className="diary-sidebar">
        <h3>Search & Filters</h3>
        <div className="filter-group">
          <input 
            type="text" 
            placeholder="Search topic..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
          <div className="filter-row">
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-input half"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-input half"
            >
              <option value="all">All Time</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <select 
            value={filterFeeling}
            onChange={(e) => setFilterFeeling(e.target.value)}
            className="filter-input"
          >
            <option value="">All Moods</option>
            <option value="happy">😊 Happy</option>
            <option value="excited">🤩 Excited</option>
            <option value="neutral">😐 Neutral</option>
            <option value="sad">😢 Sad</option>
            <option value="angry">😡 Angry</option>
            <option value="unknown">❓ Unknown</option>
          </select>
        </div>

        <hr />

        <h3>History (Click to Edit)</h3>
        <div className="history-list">
          {filteredNotes.map(n => (
            <div 
              key={n._id} 
              className={`history-item clickable ${getNoteStatusClass(n)} ${editingId === n._id ? 'active-edit' : ''}`}
              onClick={() => handleEditClick(n)}
            >
              <span className="date-tag">
                {n.reminderDate ? new Date(n.reminderDate).toLocaleString() : new Date(n.createdAt).toLocaleDateString()}
              </span>
              <p className="topic-text">{n.topic}</p>
              <div className="mood-tag">{n.feeling === 'unknown' ? '❓ Unknown' : n.feeling}</div>
              <button className="delete-btn" onClick={(e) => handleDelete(n._id, e)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="diary-main">
        <form onSubmit={handleSubmit} className="diary-form">
          <div className="form-header">
            <h2>{editingId ? 'Edit Entry' : 'New Entry'}</h2>
            {editingId && <button type="button" className="cancel-edit" onClick={resetForm}>Cancel Edit</button>}
          </div>

          <div className="form-group">
            <label>Date & Time (Reminder)</label>
            <input
              type="datetime-local"
              value={formData.reminderDate}
              onChange={e => setFormData({...formData, reminderDate: e.target.value})}
              className="datetime-input"
            />
          </div>

          <div className="form-group">
            <label>Topic</label>
            <input
              value={formData.topic}
              onChange={e => setFormData({...formData, topic: e.target.value})}
              placeholder="What's the topic?"
              required
            />
          </div>

          <div className="form-group">
            <label>Detail</label>
            <textarea
              value={formData.detail}
              onChange={e => setFormData({...formData, detail: e.target.value})}
              placeholder="Describe your plan or day..."
              required
            />
          </div>

          <div className="form-group">
            <label>How do you feel about it? (Mood)</label>
            <select
              value={formData.feeling}
              onChange={e => setFormData({...formData, feeling: e.target.value})}
            >
              <option value="unknown">❓ Unknown / Haven't Done</option>
              <option value="happy">😊 Happy</option>
              <option value="excited">🤩 Excited</option>
              <option value="neutral">😐 Neutral</option>
              <option value="sad">😢 Sad</option>
              <option value="angry">😡 Angry</option>
            </select>
          </div>

          <div className="form-group">
            <label>Result of Event</label>
            <textarea
              value={formData.result}
              onChange={e => setFormData({...formData, result: e.target.value})}
              placeholder="What was the outcome? (Fill this after the event)"
            />
          </div>

          <button type="submit" className="save-btn">
            {editingId ? 'Update Entry' : 'Save Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
