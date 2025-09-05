import React from 'react';
import './App.css'; // Your new design system
import StudentDashboard from './StudentDashboard'; // Assuming this is the main view

function Sidebar() {
  return (
    <nav className="sidebar">
      <h1 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '40px' }}>IB Studioz Hub</h1>
      {/* Add NavLinks here for routing */}
      <ul>
        <li style={{ color: 'var(--text-secondary)', listStyle: 'none', padding: '10px 0' }}>Dashboard</li>
        <li style={{ color: 'var(--text-secondary)', listStyle: 'none', padding: '10px 0' }}>Tasks</li>
        <li style={{ color: 'var(--text-secondary)', listStyle: 'none', padding: '10px 0' }}>Analytics</li>
        <li style={{ color: 'var(--text-secondary)', listStyle: 'none', padding: '10px 0' }}>Study Rooms</li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Your Router Outlet would go here */}
        <StudentDashboard />
      </main>
    </div>
  );
}

export default App;
