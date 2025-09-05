import React from "react";


function StudyRooms() {
  const rooms = [
    { name: "Calculus Study Session", subject: "Mathematics", status: "Active" },
    { name: "Physics Lab Discussion", subject: "Physics", status: "Active" },
    { name: "Computer Science Project", subject: "CS", status: "Planning" }
  ];
  return (
    <div className="ib-dashboard">
      <div className="ib-card">
        <div className="ib-card-icon"><i className="fas fa-door-open"></i></div>
        <div className="ib-card-title">Virtual Study Rooms</div>
        <div className="ib-card-content">
          <button className="ib-btn" style={{marginBottom:'1rem'}}>
            <i className="fas fa-plus"></i> Create Room
          </button>
          <h3>Rooms</h3>
          <ul>
            {rooms.map((room, idx) => (
              <li key={idx}><strong>{room.name}</strong> ({room.subject}) - {room.status}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StudyRooms;
