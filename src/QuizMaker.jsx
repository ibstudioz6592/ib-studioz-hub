import React, { useState } from "react";


function QuizMaker() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ question: "", option1: "", option2: "", option3: "", option4: "" });

  const handleChange = e => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleAddQuestion = () => {
    if (form.question && form.option1 && form.option2) {
      setQuestions([...questions, { ...form, id: Date.now() }]);
      setForm({ question: "", option1: "", option2: "", option3: "", option4: "" });
    }
  };

  return (
    <div className="ib-dashboard">
      <div className="ib-card">
        <div className="ib-card-icon"><i className="fas fa-question-circle"></i></div>
        <div className="ib-card-title">Quiz Maker</div>
        <div className="ib-card-content">
          <input type="text" className="form-input" id="question" placeholder="Enter your question" value={form.question} onChange={handleChange} />
          <input type="text" className="form-input" id="option1" placeholder="Option 1 (Correct Answer)" value={form.option1} onChange={handleChange} />
          <input type="text" className="form-input" id="option2" placeholder="Option 2" value={form.option2} onChange={handleChange} />
          <input type="text" className="form-input" id="option3" placeholder="Option 3" value={form.option3} onChange={handleChange} />
          <input type="text" className="form-input" id="option4" placeholder="Option 4" value={form.option4} onChange={handleChange} />
          <button className="ib-btn" onClick={handleAddQuestion} style={{marginTop:'0.5rem'}}>
            <i className="fas fa-save"></i> Save Quiz
          </button>
          <h3 style={{marginTop:'1.5rem'}}>Quiz Preview</h3>
          <ul>
            {questions.map((q, idx) => (
              <li key={q.id}>{q.question} ({q.option1}, {q.option2}, {q.option3}, {q.option4})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default QuizMaker;
