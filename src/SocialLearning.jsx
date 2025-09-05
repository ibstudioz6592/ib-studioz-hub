import React from "react";


function SocialLearning() {
  return (
    <div className="ib-dashboard">
      <div className="ib-card">
        <div className="ib-card-icon"><i className="fas fa-users"></i></div>
        <div className="ib-card-title">Social Learning</div>
        <div className="ib-card-content">
          <button className="ib-btn" style={{marginBottom:'1rem'}}>
            <i className="fas fa-plus"></i> Create Group
          </button>
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
      </div>
    </div>
  );
}

export default SocialLearning;
