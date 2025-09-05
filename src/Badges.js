import React from "react";

function Badges() {
  const badges = [
    { name: "First Steps", description: "Complete your first study session", earned: true },
    { name: "Week Warrior", description: "Study for 7 consecutive days", earned: true },
    { name: "Quiz Master", description: "Score 90% or higher on 5 quizzes", earned: false },
    { name: "Time Manager", description: "Use time tracker for 30 sessions", earned: false }
  ];
  return (
    <div className="feature-panel" id="badges-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-medal"></i> Achievement Badges</h2>
        <div className="btn-secondary">
          <i className="fas fa-trophy"></i> View All
        </div>
      </div>
      <div className="badges-container">
        {badges.map((badge, idx) => (
          <div key={idx} className={`badge-item${badge.earned ? ' badge-earned' : ''}`}>
            <div className="badge-name">{badge.name}</div>
            <div className="badge-desc">{badge.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Badges;
