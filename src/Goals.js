import React, { useState } from "react";

function Goals() {
  const [goals, setGoals] = useState([
    { title: "Complete Calculus Chapter 5", deadline: "2025-09-15", progress: 60, status: "in-progress" },
    { title: "Read 50 pages of Physics textbook", deadline: "2025-08-30", progress: 100, status: "completed" }
  ]);
  return (
    <div className="feature-panel" id="goals-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-bullseye"></i> Study Goals</h2>
        <button className="btn-secondary">
          <i className="fas fa-plus"></i> Add Goal
        </button>
      </div>
      <div className="goals-container">
        <div className="goals-progress">
          <h3>Current Goals</h3>
          <ul>
            {goals.map((goal, idx) => (
              <li key={idx}>
                <strong>{goal.title}</strong> - Due: {goal.deadline} - {goal.progress}% Complete ({goal.status})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Goals;
