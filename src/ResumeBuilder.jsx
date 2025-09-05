import React, { useState } from "react";


function ResumeBuilder() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", summary: "" });
  const handleChange = e => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };
  return (
    <div className="ib-dashboard">
      <div className="ib-card">
        <div className="ib-card-icon"><i className="fas fa-file-alt"></i></div>
        <div className="ib-card-title">Resume Builder</div>
        <div className="ib-card-content">
          <input type="text" className="form-input" id="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <input type="email" className="form-input" id="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input type="tel" className="form-input" id="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <textarea className="form-textarea" id="summary" placeholder="Professional Summary" value={form.summary} onChange={handleChange} />
          <button className="ib-btn" style={{marginTop:'1rem'}}>
            <i className="fas fa-download"></i> Download Resume
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
