// Enhanced StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  FiHome, FiCalendar, FiCheckSquare, FiBarChart2, FiTarget, 
  FiUsers, FiHelpCircle, FiGitBranch, FiFileText, FiMessageSquare, 
  FiAward, FiFile, FiSettings, FiBell, FiUser, FiMenu, FiX 
} from 'react-icons/fi';
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
import AdminPanel from "./AdminPanel.jsx"; // New admin component

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(5);
  const [userRole, setUserRole] = useState('admin'); // Admin role

  // Navigation items with role-based access
  const navigation = [
    { id: 'overview', name: 'Dashboard', icon: FiHome, roles: ['student', 'teacher', 'admin'] },
    { id: 'planner', name: 'Planner', icon: FiCalendar, roles: ['student', 'teacher', 'admin'] },
    { id: 'tasks', name: 'Task Manager', icon: FiCheckSquare, roles: ['student', 'teacher', 'admin'] },
    { id: 'analytics', name: 'Analytics', icon: FiBarChart2, roles: ['teacher', 'admin'] },
    { id: 'goals', name: 'Goals', icon: FiTarget, roles: ['student', 'admin'] },
    { id: 'social', name: 'Social Learning', icon: FiUsers, roles: ['student', 'teacher', 'admin'] },
    { id: 'quiz', name: 'Quiz Maker', icon: FiHelpCircle, roles: ['teacher', 'admin'] },
    { id: 'mindmap', name: 'Mind Map', icon: FiGitBranch, roles: ['student', 'teacher', 'admin'] },
    { id: 'notes', name: 'Collab Notes', icon: FiFileText, roles: ['student', 'teacher', 'admin'] },
    { id: 'rooms', name: 'Study Rooms', icon: FiMessageSquare, roles: ['student', 'teacher', 'admin'] },
    { id: 'badges', name: 'Achievements', icon: FiAward, roles: ['student', 'admin'] },
    { id: 'resume', name: 'Resume Builder', icon: FiFile, roles: ['student', 'admin'] },
    { id: 'ai', name: 'AI Assistant', icon: FiSettings, roles: ['student', 'teacher', 'admin'] },
    { id: 'admin', name: 'Admin Panel', icon: FiSettings, roles: ['admin'] },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  // Render active component
  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'overview': return <DashboardOverview userRole={userRole} />;
      case 'planner': return <Planner userRole={userRole} />;
      case 'tasks': return <TaskManager userRole={userRole} />;
      case 'analytics': return <Analytics userRole={userRole} />;
      case 'goals': return <Goals userRole={userRole} />;
      case 'social': return <SocialLearning userRole={userRole} />;
      case 'quiz': return <QuizMaker userRole={userRole} />;
      case 'mindmap': return <MindMap userRole={userRole} />;
      case 'notes': return <CollaborativeNotes userRole={userRole} />;
      case 'rooms': return <StudyRooms userRole={userRole} />;
      case 'badges': return <Badges userRole={userRole} />;
      case 'resume': return <ResumeBuilder userRole={userRole} />;
      case 'ai': return <AIAssistant userRole={userRole} />;
      case 'admin': return <AdminPanel />;
      default: return <DashboardOverview userRole={userRole} />;
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                IB
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-800 dark:text-white">Studioz Hub</h1>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredNavigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600 dark:border-indigo-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <item.icon className="text-xl" />
              {sidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-800 dark:text-indigo-200 font-bold">
              A
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
              {filteredNavigation.find(t => t.id === activeTab)?.name}
            </h2>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <FiBell size={20} />
                </button>
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-800 dark:text-indigo-200 font-bold">
                  A
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
