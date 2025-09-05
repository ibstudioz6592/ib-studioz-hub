// Enhanced DashboardOverview.jsx
import React from 'react';
import { 
  FiBook, FiFileText, FiUsers, FiAward, FiTrendingUp, 
  FiClock, FiCalendar, FiBarChart2, FiTarget 
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardOverview = ({ userRole }) => {
  // Sample data for charts
  const performanceData = [
    { name: 'Jan', score: 65 },
    { name: 'Feb', score: 72 },
    { name: 'Mar', score: 80 },
    { name: 'Apr', score: 78 },
    { name: 'May', score: 85 },
    { name: 'Jun', score: 90 },
  ];

  const subjectData = [
    { name: 'Math', value: 35 },
    { name: 'Science', value: 25 },
    { name: 'History', value: 20 },
    { name: 'English', value: 15 },
    { name: 'Arts', value: 5 },
  ];

  const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#eff6ff'];

  // Stats cards data
  const stats = [
    { title: 'Learning Materials', value: '24', icon: FiBook, change: '+12%', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
    { title: 'Study Streak', value: '15 days', icon: FiAward, change: 'Personal best!', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { title: 'Upcoming Events', value: '7', icon: FiCalendar, change: 'Next in 2 days', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    { title: 'Completed Tasks', value: '42', icon: FiCheckSquare, change: '+8% this week', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your learning today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Performance Trend</h3>
            <div className="flex items-center text-sm text-green-500">
              <FiTrendingUp className="mr-1" /> 12.5%
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151', 
                    borderRadius: '0.5rem',
                    color: '#f9fafb'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Subject Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151', 
                    borderRadius: '0.5rem',
                    color: '#f9fafb'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { user: 'You', action: 'completed', item: 'Physics Assignment', time: '2 hours ago' },
              { user: 'Study Group', action: 'added new notes to', item: 'Chemistry Chapter 5', time: '5 hours ago' },
              { user: 'You', action: 'achieved', item: '7-day study streak', time: 'Yesterday' },
              { user: 'Prof. Johnson', action: 'posted', item: 'New quiz on Calculus', time: '2 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FiUsers size={16} />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upcoming Events</h3>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Physics Quiz', date: 'Tomorrow, 10:00 AM', type: 'quiz' },
              { title: 'Math Study Group', date: 'Jun 15, 3:00 PM', type: 'study' },
              { title: 'AI Seminar', date: 'Jun 18, 11:00 AM', type: 'seminar' },
              { title: 'Project Deadline', date: 'Jun 20, 11:59 PM', type: 'deadline' },
            ].map((event, index) => (
              <div key={index} className="flex items-start">
                <div className={`flex-shrink-0 mt-1 w-10 h-10 rounded-lg flex items-center justify-center ${
                  event.type === 'quiz' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  event.type === 'study' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  event.type === 'seminar' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}>
                  <FiCalendar size={16} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{event.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
