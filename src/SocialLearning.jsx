import React from "react";

function SocialLearning() {
  return (
    <div className="feature-panel" id="social-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-users"></i> Social Learning</h2>
        <button className="btn-secondary">
          <i className="fas fa-plus"></i> Create Group
        </button>
      </div>
      <div className="social-container">
        <div className="study-groups">
          <h3>Study Groups</h3>
          <ul>
            <li>Mathematics Study Group - 5 members</li>
            <li>Physics Lab Partners - 3 members</li>
          </ul>
        </div>
        <div className="discussion-feed">
          <h3>Discussion Feed</h3>
          <ul>
            <li>Sarah M.: Can someone explain the difference between integration by parts and substitution?</li>
            <li>Alex K.: Found this amazing physics simulation tool for understanding wave mechanics!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SocialLearning;
