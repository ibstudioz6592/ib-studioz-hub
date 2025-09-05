
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const cards = [
  { label: "Materials", icon: ["fas", "book"], key: "materialsCount" },
  { label: "PYQs", icon: ["fas", "file-alt"], key: "pyqsCount" },
  { label: "Seminars", icon: ["fas", "chalkboard-teacher"], key: "seminarsCount" },
  { label: "Credits", icon: ["fas", "certificate"], key: "creditsCount" },
  { label: "Study Streak", icon: ["fas", "fire"], key: "streakCount" },
  { label: "Study Hours", icon: ["fas", "clock"], key: "hoursCount" },
];

function DashboardOverview(props) {
  return (
    <div className="ib-dashboard">
      {cards.map(card => (
        <div className="ib-card" key={card.key}>
          <div className="ib-card-icon">
            <FontAwesomeIcon icon={card.icon} />
          </div>
          <div className="ib-card-title">{card.label}</div>
          <div className="ib-card-content">{props[card.key]}</div>
        </div>
      ))}
    </div>
  );
}

export default DashboardOverview;
