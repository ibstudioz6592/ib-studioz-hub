import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'; // Example using a library

const progressData = [
  { subject: 'Math', value: 85 },
  { subject: 'Physics', value: 72 },
  { subject: 'Chemistry', value: 91 },
  { subject: 'CS', value: 78 },
];

const ProgressTracker = ({ subject, value }) => {
  const accentColors = {
    Math: '#007aff',
    Physics: '#ff9500',
    Chemistry: '#34c759',
    CS: '#af52de',
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{subject}</span>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{value}% Complete</span>
      </div>
      <div style={{ background: 'var(--fill-primary)', borderRadius: 'var(--border-radius-sm)', height: '8px' }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${accentColors[subject] || 'var(--accent-primary)'} 0%, rgba(255,255,255,0.3) 100%)`,
          borderRadius: 'var(--border-radius-sm)',
          transition: 'width var(--transition-slow)'
        }}></div>
      </div>
    </div>
  );
};


function Analytics() {
  return (
    <div className="ib-card">
      <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '24px' }}>Progress Analytics</h2>
      <div>
        {progressData.map(item => (
          <ProgressTracker key={item.subject} subject={item.subject} value={item.value} />
        ))}
      </div>
      <button className="ib-button ib-button-secondary" style={{ width: '100%', marginTop: '20px' }}>
        View Detailed Report
      </button>
    </div>
  );
}

export default Analytics;
