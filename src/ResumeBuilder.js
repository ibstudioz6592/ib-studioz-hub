import React, { useState } from "react";

function ResumeBuilder() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", summary: "" });
  const handleChange = e => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };
  return (
    <div className="feature-panel" id="resume-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-file-alt"></i> Resume Builder</h2>
        <button className="btn-primary">
          <i className="fas fa-download"></i> Download Resume
        </button>
      </div>
      <div>
        <input type="text" className="form-input" id="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
        <input type="email" className="form-input" id="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input type="tel" className="form-input" id="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <textarea className="form-textarea" id="summary" placeholder="Professional Summary" value={form.summary} onChange={handleChange} />
      </div>
    </div>
  );
}

export default ResumeBuilder;
