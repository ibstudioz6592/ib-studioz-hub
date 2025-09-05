import React from "react";

function StudyRooms() {
  const rooms = [
    { name: "Calculus Study Session", subject: "Mathematics", status: "Active" },
    { name: "Physics Lab Discussion", subject: "Physics", status: "Active" },
    { name: "Computer Science Project", subject: "CS", status: "Planning" }
  ];
  return (
    <div className="feature-panel" id="study-rooms-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-door-open"></i> Virtual Study Rooms</h2>
        <button className="btn-secondary">
          <i className="fas fa-plus"></i> Create Room
        </button>
      </div>
      <div>
        <h3>Rooms</h3>
        <ul>
          {rooms.map((room, idx) => (
            <li key={idx}><strong>{room.name}</strong> ({room.subject}) - {room.status}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StudyRooms;
