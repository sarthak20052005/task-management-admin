import React from 'react';
import './Comp Css/Notes.css';

const Notes = ({ noteText, onChange, onClose, onSave }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <textarea
          value={noteText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your notes here..."
        />
        <div className="modal-buttons">
          <button onClick={onSave}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
