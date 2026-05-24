import { useState, useEffect } from 'react';
import axios from 'axios';
import './Diary.css';

export default function DiaryDashboard() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({
    topic: '',
    detail: '',
    feeling: 'neutral',
    type: 'diary'
  });

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/v2/notes');
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
      await axios.post('/v2/notes', formData);
      setFormData({ topic: '', detail: '', feeling: 'neutral', type: 'diary' });
      fetchNotes();
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/v2/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <div className="diary-dashboard">
      <div className="diary-sidebar">
        <h3>Calendar / History</h3>
        <div className="history-list">
          {notes.map(n => (
            <div key={n._id} className="history-item">
              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
              <p>{n.topic}</p>
              <button onClick={() => handleDelete(n._id)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="diary-main">
        <form onSubmit={handleSubmit} className="diary-form">
          <div className="form-group">
            <label>Topic</label>
            <input 
              value={formData.topic} 
              onChange={e => setFormData({...formData, topic: e.target.value})}
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div className="form-group">
            <label>Detail</label>
            <textarea 
              value={formData.detail} 
              onChange={e => setFormData({...formData, detail: e.target.value})}
              placeholder="Describe your day..."
              required
            />
          </div>

          <div className="form-group">
            <label>Result & Feeling (Mood)</label>
            <select 
              value={formData.feeling} 
              onChange={e => setFormData({...formData, feeling: e.target.value})}
            >
              <option value="happy">😊 Happy</option>
              <option value="excited">🤩 Excited</option>
              <option value="neutral">😐 Neutral</option>
              <option value="sad">😢 Sad</option>
              <option value="angry">😠 Angry</option>
            </select>
          </div>

          <div className="form-group">
            <label>Type</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  value="diary" 
                  checked={formData.type === 'diary'} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                /> Diary
              </label>
              <label>
                <input 
                  type="radio" 
                  value="reminder" 
                  checked={formData.type === 'reminder'} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                /> Reminder
              </label>
            </div>
          </div>

          <button type="submit" className="save-btn">Save Entry</button>
        </form>
      </div>
    </div>
  );
}
