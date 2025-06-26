import React, { useState } from 'react';
import { Check, Trash2, StickyNote, Pencil, X, Save, Flag } from 'lucide-react';

// Components
import Notes from './Notes';

const Task = ({ 
  task, 
  onComplete, 
  onDelete, 
  onSave, 
  onEdit, 
  priority,
  isEditing,
  editingText,
  setEditingText,
  onSaveEdit,
  onCancelEdit
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState(task.note || '');
  
  const handleSaveNote = () => {
    onSave(task.id, notesText);
    setShowNotes(false);
  };

  const handleEditTask = () => {
    if (onEdit) {
      onEdit(); 
    }
  };

  const handleSaveEdit = () => {
    if (onSaveEdit) {
      onSaveEdit(); 
    }
  };

  const handleCancelEdit = () => {
    if (onCancelEdit) {
      onCancelEdit(); 
    }
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`} style={{borderBottomColor: priority === 'low' ? "#44ff44" : priority === 'mid' ? '#ffd528' :'#ff4444'}}>
      <div className="task-content">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button
            onClick={() => onComplete(task.id)}
            className={`checkbox ${task.completed ? 'checked' : ''}`}
          >
            {task.completed && <Check size={12} />}
          </button>

          <div className="content">
            {isEditing ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="edit-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                autoFocus
              />
            ) : (
              <div className={`task-text ${task.completed ? 'strikethrough' : ''}`}>
                {task.text}
              </div>
            )}
            <div className="deadline-text">
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className='priority'>
          {(priority === "low") ? (
            <Flag size={16} color="#44ff44" />
          ): (priority === "mid") ? (
            <Flag size={16} color="#ffaa44" />
          ):(
            <Flag size={16} color="#ff4444" />
          )}
          <span>{priority}</span>
        </div>
      </div>

      <button onClick={() => setShowNotes(true)} className="note-btn">
        <StickyNote size={16} />
      </button>

      {isEditing ? (
        <>
          <button onClick={handleSaveEdit} title="Save changes">
            <Save size={16} />
          </button>
          <button onClick={handleCancelEdit} title="Cancel editing">
            <X size={16} />
          </button>
        </>
      ) : (
        <button onClick={handleEditTask} title="Edit task">
          <Pencil size={16} />
        </button>
      )}

      <button onClick={() => onDelete(task.id)} className="delete-btn">
        <Trash2 size={16} />
      </button>

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