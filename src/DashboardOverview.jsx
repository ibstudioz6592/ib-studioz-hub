import React from "react";

function DashboardOverview({ materialsCount, pyqsCount, seminarsCount, creditsCount, streakCount, hoursCount }) {
  return (
    <div className="dashboard-overview">
      <div className="overview-card">
        <div className="overview-number">{materialsCount}</div>
        <div className="overview-label">Materials</div>
      </div>
      <div className="overview-card">
        <div className="overview-number">{pyqsCount}</div>
        <div className="overview-label">PYQs</div>
      </div>
      <div className="overview-card">
        <div className="overview-number">{seminarsCount}</div>
        <div className="overview-label">Seminars</div>
      </div>
      <div className="overview-card">
        <div className="overview-number">{creditsCount}</div>
        <div className="overview-label">Credits</div>
      </div>
      <div className="overview-card">
        <div className="overview-number">{streakCount}</div>
        <div className="overview-label">Streak</div>
      </div>
      <div className="overview-card">
        <div className="overview-number">{hoursCount}</div>
        <div className="overview-label">Hours</div>
      </div>
    </div>
  );
}

export default DashboardOverview;
