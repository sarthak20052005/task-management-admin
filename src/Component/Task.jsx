import React, { useState } from 'react';
import { Check, Trash2, StickyNote, Pencil, X, Save } from 'lucide-react';

// Components
import Notes from './Notes';

const Task = ({ task, onComplete, onDelete, onSave, onEdit }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState(task.note || '');
  const [isEdit, setIsEdit] = useState(false);
  const [editedTask, setEditedTask] = useState(task.text || '');

  const handleSaveNote = () => {
    onSave(task.id, notesText);
    setShowNotes(false);
  };

  const handleEditTask = () => {
    if (editedTask.trim()) {
      onEdit(task.id, editedTask.trim());
      setIsEdit(false);
    }
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

        <div className="content">
          {isEdit ? (
            <input
              type="text"
              value={editedTask}
              onChange={(e) => setEditedTask(e.target.value)}
              className="edit-input"
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

      <button onClick={() => setShowNotes(true)} className="note-btn">
        <StickyNote size={16} />
      </button>

      {isEdit ? (
        <>
          <button onClick={handleEditTask}>
            <Save size={16} />
          </button>
          <button onClick={() => setIsEdit(false)}>
            <X size={16} />
          </button>
        </>
      ) : (
        <button onClick={() => setIsEdit(true)}>
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
