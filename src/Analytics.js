import React, { useState } from "react";

function Analytics() {
  // Example progress data
  const [progress, setProgress] = useState({
    mathematics: 85,
    physics: 72,
    chemistry: 91,
    computerScience: 78
  });
  return (
    <div className="feature-panel" id="analytics-panel">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-chart-line"></i> Progress Analytics</h2>
        <div className="btn-secondary">
          <i className="fas fa-download"></i> Export Report
        </div>
      </div>
      <div className="analytics-container">
        <div className="analytics-chart">
          <div className="chart-title">Study Progress</div>
          {Object.entries(progress).map(([subject, value]) => (
            <div key={subject} style={{ marginBottom: 20 }}>
              <div className="progress-label">
                <span className="progress-text">{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                <span className="progress-value">{value}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
