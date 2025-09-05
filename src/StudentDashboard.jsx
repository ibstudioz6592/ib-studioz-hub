import React, { useState } from 'react';
import DashboardOverview from "./DashboardOverview.jsx";
import Planner from "./Planner.jsx";
import TaskManager from "./TaskManager.jsx";
import Analytics from "./Analytics.jsx";
import Goals from "./Goals.jsx";
import SocialLearning from "./SocialLearning.jsx";
import QuizMaker from "./QuizMaker.jsx";
import MindMap from "./MindMap.jsx";
import CollaborativeNotes from "./CollaborativeNotes.jsx";
import StudyRooms from "./StudyRooms.jsx";
import Badges from "./Badges.jsx";
import ResumeBuilder from "./ResumeBuilder.jsx";
import AIAssistant from "./AIAssistant.jsx";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'planner', name: 'Planner', icon: '📅' },
    { id: 'tasks', name: 'Tasks', icon: '✅' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'goals', name: 'Goals', icon: '🎯' },
    { id: 'social', name: 'Social Learning', icon: '👥' },
    { id: 'quiz', name: 'Quiz Maker', icon: '❓' },
    { id: 'mindmap', name: 'Mind Map', icon: '🧠' },
    { id: 'notes', name: 'Collaborative Notes', icon: '📝' },
    { id: 'rooms', name: 'Study Rooms', icon: '🏠' },
    { id: 'badges', name: 'Badges', icon: '🏆' },
    { id: 'resume', name: 'Resume Builder', icon: '📄' },
    { id: 'ai', name: 'AI Assistant', icon: '🤖' }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return <DashboardOverview materialsCount={"24"} pyqsCount={"18"} seminarsCount={"7"} creditsCount={"92"} streakCount={"15"} hoursCount={"124"} />;
      case 'planner':
        return <Planner />;
      case 'tasks':
        return <TaskManager />;
      case 'analytics':
        return <Analytics />;
      case 'goals':
        return <Goals />;
      case 'social':
        return <SocialLearning />;
      case 'quiz':
        return <QuizMaker />;
      case 'mindmap':
        return <MindMap />;
      case 'notes':
        return <CollaborativeNotes />;
      case 'rooms':
        return <StudyRooms />;
      case 'badges':
        return <Badges />;
      case 'resume':
        return <ResumeBuilder />;
      case 'ai':
        return <AIAssistant />;
      default:
        return <DashboardOverview materialsCount={"24"} pyqsCount={"18"} seminarsCount={"7"} creditsCount={"92"} streakCount={"15"} hoursCount={"124"} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-indigo-700">StudentHub</h1>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-3">{tab.icon}</span>
              {sidebarOpen && <span className="font-medium">{tab.name}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold">
              JS
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                <span className="text-xl">⚙️</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
