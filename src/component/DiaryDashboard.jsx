import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Diary.css';

export default function DiaryDashboard() {
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    reminderDate: '',
    topic: '',
    detail: '',
    feeling: 'unknown',
    result: ''
  });

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterFeeling, setFilterFeeling] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, upcoming, past

  const fetchNotes = async () => {
    try {
      const response = await axios.get('v2/notes');
      setNotes(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notes', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`v2/notes/${editingId}`, formData);
      } else {
        await axios.post('v2/notes', formData);
      }
      resetForm();
      fetchNotes();
    } catch (error) {
      console.error('Failed to save note', error);
    }
  };

  const resetForm = () => {
    setFormData({ reminderDate: '', topic: '', detail: '', feeling: 'unknown', result: '' });
    setEditingId(null);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent loading into form when deleting
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete(`v2/notes/${id}`);
      if (editingId === id) resetForm();
      fetchNotes();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleEditClick = (note) => {
    setEditingId(note._id);
    setFormData({
      reminderDate: note.reminderDate ? note.reminderDate.substring(0, 16) : '',
      topic: note.topic,
      detail: note.detail,
      feeling: note.feeling,
      result: note.result || ''
    });
  };

  // Filtering Logic
  const filteredNotes = useMemo(() => {
    const now = new Date();
    return notes.filter(note => {
      const date = new Date(note.reminderDate || note.createdAt);
      
      const matchesSearch = note.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFeeling = filterFeeling ? note.feeling === filterFeeling : true;
      const matchesDate = filterDate ? date.toLocaleDateString() === new Date(filterDate).toLocaleDateString() : true;
      
      let matchesStatus = true;
      if (statusFilter === 'upcoming') {
        matchesStatus = note.reminderDate && new Date(note.reminderDate) > now;
      } else if (statusFilter === 'past') {
        matchesStatus = !note.reminderDate || new Date(note.reminderDate) <= now;
      }

      return matchesSearch && matchesFeeling && matchesDate && matchesStatus;
    });
  }, [notes, searchQuery, filterDate, filterFeeling, statusFilter]);

  const getNoteStatusClass = (note) => {
    const now = new Date();
    const reminderDate = note.reminderDate ? new Date(note.reminderDate) : null;
    
    if (reminderDate && reminderDate > now) return 'status-future';
    if (note.feeling === 'unknown') return 'status-missing-feeling';
    return '';
  };

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
