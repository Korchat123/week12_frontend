/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const DiaryContext = createContext();

export const DiaryProvider = ({ children }) => {
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
  const [entryTypeFilter, setEntryTypeFilter] = useState('event'); // all, diary, event

  const fetchNotes = async () => {
    try {
      const response = await axios.get('api/v2/notes');
      setNotes(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notes', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
  }, []);

  const resetForm = () => {
    setFormData({ reminderDate: '', topic: '', detail: '', feeling: 'unknown', result: '' });
    setEditingId(null);
  };

  const createNote = async (payload) => {
    const response = await axios.post('api/v2/notes', payload);
    await fetchNotes();
    return response.data.data;
  };

  const updateNote = async (id, payload) => {
    const response = await axios.put(`api/v2/notes/${id}`, payload);
    await fetchNotes();
    return response.data.data;
  };

  const deleteNote = async (id) => {
    await axios.delete(`api/v2/notes/${id}`);
    if (editingId === id) resetForm();
    await fetchNotes();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        type: formData.reminderDate ? 'reminder' : 'diary',
        reminderKind: formData.reminderDate ? 'event' : undefined
      };

      if (editingId) {
        await updateNote(editingId, payload);
      } else {
        await createNote(payload);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save note', error);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation(); // Prevent loading into form when deleting
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deleteNote(id);
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
      const isEventEntry = note.type === 'reminder' && note.reminderKind !== 'daily';
      const matchesEntryType = entryTypeFilter === 'all'
        ? true
        : entryTypeFilter === 'event'
          ? isEventEntry
          : !isEventEntry;
      
      let matchesStatus = true;
      if (statusFilter === 'upcoming') {
        matchesStatus = note.reminderDate && new Date(note.reminderDate) > now;
      } else if (statusFilter === 'past') {
        matchesStatus = !note.reminderDate || new Date(note.reminderDate) <= now;
      }

      return matchesSearch && matchesFeeling && matchesDate && matchesStatus && matchesEntryType;
    });
  }, [notes, searchQuery, filterDate, filterFeeling, statusFilter, entryTypeFilter]);

  const getNoteStatusClass = (note) => {
    const now = new Date();
    const reminderDate = note.reminderDate ? new Date(note.reminderDate) : null;
    
    if (reminderDate && reminderDate > now) return 'status-future';
    if (note.feeling === 'unknown') return 'status-missing-feeling';
    return '';
  };

  const value = {
    notes,
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
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    handleSubmit,
    resetForm,
    handleDelete,
    handleEditClick,
    filteredNotes,
    getNoteStatusClass
  };

  return (
    <DiaryContext.Provider value={value}>
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};
