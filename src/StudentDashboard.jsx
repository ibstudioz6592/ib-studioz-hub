import React from 'react';
import Analytics from './Analytics';
import TaskManager from './TaskManager';
import AIAssistant from './AIAssistant';
import StudyRooms from './StudyRooms';

// Create a new CSS file for this component's specific layout
// StudentDashboard.css
/*
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: calc(var(--spacing-unit) * 3);
}

.dashboard-grid .grid-item-span-2 {
  grid-column: span 2;
}
*/

function StudentDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: 'var(--font-size-xxl)', marginBottom: '8px' }}>Welcome Back!</h1>
      <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Here's your overview for Friday, 5 September 2025.
      </p>

      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'calc(var(--spacing-unit) * 3)'
      }}>
        <div className="grid-item-span-2" style={{ gridColumn: '1 / -1' }}>
          <TaskManager />
        </div>
        <Analytics />
        <AIAssistant />
        {/* Add more components like StudyRooms, Planner, etc. here */}
      </div>
    </div>
  );
}

export default StudentDashboard;
