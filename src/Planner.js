import React, { useState } from "react";

function Planner() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", date: "", time: "", duration: "" });

  const handleChange = e => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleAddEvent = () => {
    if (form.title && form.date) {
      setEvents([...events, { ...form, id: Date.now() }]);
      setForm({ title: "", subject: "", date: "", time: "", duration: "" });
      setShowModal(false);
    }
  };

  return (
    <div className="feature-panel" id="planner-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-calendar-alt"></i> Study Planner</h2>
        <button className="btn-secondary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Add Event
        </button>
      </div>
      <div className="planner-container">
        {/* Sidebar and calendar UI can be added here */}
        <div>
          <h4>Events</h4>
          <ul>
            {events.map(event => (
              <li key={event.id}>{event.title} - {event.date}</li>
            ))}
          </ul>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Event</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <input type="text" className="form-input" id="title" placeholder="Enter event title" value={form.title} onChange={handleChange} />
              <input type="text" className="form-input" id="subject" placeholder="Enter subject" value={form.subject} onChange={handleChange} />
              <input type="date" className="form-input" id="date" value={form.date} onChange={handleChange} />
              <input type="time" className="form-input" id="time" value={form.time} onChange={handleChange} />
              <input type="number" className="form-input" id="duration" placeholder="Duration (minutes)" value={form.duration} onChange={handleChange} />
              <button className="btn-primary" onClick={handleAddEvent}>Save Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Planner;
