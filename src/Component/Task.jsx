import React, { useState } from 'react';
import { Check, Trash2,StickyNote } from 'lucide-react';

//compnents
import Notes from './Notes';

const Task = ({ task, onComplete, onDelete, onSaveNote }) => {

  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState(task.note || '');

  const handleSaveNote = () => {
    onSaveNote(task.id, notesText); // Call back to App to store note
    setShowNotes(false);
  };

  const toggleNotes = () => {
    setShowNotes(prev => !prev);
    setNoteText(task.note || '');
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <button
          onClick={() => onComplete(task.id)}
          className={`checkbox ${task.completed ? 'checked' : ''}`}
        >
          {task.completed && <Check size={12} />}
        </button>
        <span className={`task-text ${task.completed ? 'strikethrough' : ''}`}>
          {task.text}
        </span>
        {onComplete ? <span className='deadline-text'>
          Deadline:{new Date(task.deadline).toLocaleDateString()}
        </span>:''}
      </div>
      {/* Notes Button */}
      <button onClick={() => setShowNotes(true)} className="note-btn">
        <StickyNote size={16} />
      </button>

      <button
        onClick={() => onDelete(task.id)}
        className="delete-btn"
      >
        <Trash2 size={16} />
      </button>
      {/* Notes Modal */}
      {showNotes && (
        <Notes
          noteText={notesText}
          onChange={setNotesText}
          onClose={() => setShowNotes(false)}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
};

export default Task;