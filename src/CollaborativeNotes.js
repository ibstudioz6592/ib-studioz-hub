import React, { useState } from "react";

function CollaborativeNotes() {
  const [notes, setNotes] = useState([
    { title: "Mathematics - Calculus", preview: "Integration techniques and applications..." },
    { title: "Physics - Mechanics", preview: "Newton's laws and motion equations..." },
    { title: "Chemistry - Organic", preview: "Functional groups and reactions..." }
  ]);
  return (
    <div className="feature-panel" id="collab-notes-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-edit"></i> Collaborative Notes</h2>
        <button className="btn-secondary">
          <i className="fas fa-plus"></i> New Note
        </button>
      </div>
      <div>
        <h3>My Notes</h3>
        <ul>
          {notes.map((note, idx) => (
            <li key={idx}><strong>{note.title}</strong>: {note.preview}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CollaborativeNotes;
