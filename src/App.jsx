import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp, setLogLevel } from 'firebase/firestore';
import {
  Sparkles, ListChecks, GraduationCap, Lightbulb, User, MessageSquare, Plus, Trash2, CheckCircle, Pencil, Send, Smile, Paperclip,
  CheckCircle2, XCircle, Users, Bell, Search, Star, MessageSquareDashed
} from 'lucide-react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// Set Firebase debug log level
setLogLevel('debug');

const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Utility function for exponential backoff
const withBackoff = async (fn, maxRetries = 5, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (error.status === 429 && i < maxRetries - 1) {
                console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            } else {
                throw error;
            }
        }
    }
};

// Main App component
const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            if (typeof __initial_auth_token !== 'undefined') {
              await signInWithCustomToken(firebaseAuth, __initial_auth_token);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase Auth Error:", error);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase Initialization Error:", error);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 font-inter">
      <StudentDashboard db={db} auth={auth} userId={userId} />
    </div>
  );
};

// --- StudentDashboard Component ---
const StudentDashboard = ({ db, auth, userId }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const userGreeting = auth.currentUser?.isAnonymous ? 'Guest' : auth.currentUser?.displayName || 'Student';

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex flex-col sm:flex-row items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4 sm:mb-0">
          <GraduationCap className="h-8 w-8 text-indigo-500 mr-2" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Academic Hub</h1>
        </div>
        <div className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-medium transition-colors duration-200 ${activeTab === 'dashboard' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-medium transition-colors duration-200 ${activeTab === 'tasks' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-medium transition-colors duration-200 ${activeTab === 'ai' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('study-rooms')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-medium transition-colors duration-200 ${activeTab === 'study-rooms' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            Study Rooms
          </button>
        </div>
      </header>

      <main className="flex-1 mt-6">
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Welcome Back, {userGreeting}!</h2>
                      <p className="text-sm sm:text-base font-light opacity-80">
                        Here's your academic overview.
                      </p>
                    </div>
                    <User className="h-10 w-10 sm:h-12 sm:w-12 opacity-30" />
                  </div>
                </div>
            </div>
            <TaskManager db={db} userId={userId} />
            <Analytics />
          </div>
        )}
        {activeTab === 'tasks' && <TaskManager db={db} userId={userId} />}
        {activeTab === 'ai' && <AIAssistant />}
        {activeTab === 'study-rooms' && <StudyRooms db={db} userId={userId} />}
      </main>
      <footer className="text-center mt-8 py-4 text-gray-500 text-sm border-t border-gray-200 dark:border-gray-700">
        &copy; 2025 Academic Hub. All rights reserved.
      </footer>
    </div>
  );
};

// --- TaskManager Component ---
const TaskManager = ({ db, userId }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const tasksCollectionRef = db ? collection(db, `artifacts/${appId}/users/${userId}/tasks`) : null;

  useEffect(() => {
    if (tasksCollectionRef) {
      const q = query(tasksCollectionRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(fetchedTasks.sort((a, b) => a.completed - b.completed || a.createdAt?.toDate() - b.createdAt?.toDate()));
      }, (error) => {
        console.error("Error fetching tasks: ", error);
      });
      return () => unsubscribe();
    }
  }, [tasksCollectionRef]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    try {
      if (tasksCollectionRef) {
        await addDoc(tasksCollectionRef, {
          text: newTaskText,
          completed: false,
          createdAt: serverTimestamp(),
        });
        setNewTaskText('');
      }
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const taskDocRef = doc(db, `artifacts/${appId}/users/${userId}/tasks/${id}`);
      await updateDoc(taskDocRef, { completed: !completed });
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const taskDocRef = doc(db, `artifacts/${appId}/users/${userId}/tasks/${id}`);
      await deleteDoc(taskDocRef);
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTaskText(task.text);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    try {
      const taskDocRef = doc(db, `artifacts/${appId}/users/${userId}/tasks/${editingTask.id}`);
      await updateDoc(taskDocRef, { text: newTaskText });
      setEditingTask(null);
      setNewTaskText('');
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 col-span-1 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <ListChecks className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">My To-Do List</h3>
      </div>
      <form onSubmit={editingTask ? handleUpdateTask : handleAddTask} className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder={editingTask ? "Edit task..." : "Add a new task..."}
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200"
        >
          {editingTask ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </form>
      <ul className="flex-1 overflow-y-auto space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${task.completed ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 line-through' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <div
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => handleToggleComplete(task.id, task.completed)}
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2 text-gray-400" />
                )}
                <span>{task.text}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTask(task)}
                  className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <MessageSquareDashed className="w-12 h-12 mx-auto mb-2" />
            <p>No tasks yet. Add one above!</p>
          </div>
        )}
      </ul>
    </div>
  );
};

// --- Analytics Component ---
const Analytics = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 col-span-1">
      <div className="flex items-center mb-4">
        <Sparkles className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">Your Progress</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-4xl font-bold text-indigo-500">7</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tasks Completed</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-4xl font-bold text-purple-500">80%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Goal Met</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-4xl font-bold text-green-500">2h</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Study Time</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-4xl font-bold text-yellow-500">4.5</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">GPA</p>
        </div>
      </div>
    </div>
  );
};

// --- AIAssistant Component ---
const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = "You are a helpful study assistant named 'Sparky'. Provide concise and encouraging answers to student queries. If asked to write code, provide it directly without extra conversational text. If asked about real-time data, state that you cannot access it.";
      const userQuery = input;
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
      };

      const fetchWithBackoff = async () => {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        return response;
      };

      const response = await withBackoff(fetchWithBackoff);
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setMessages(prev => [...prev, { text, sender: 'ai' }]);
      } else {
        setMessages(prev => [...prev, { text: 'Sorry, I could not generate a response.', sender: 'ai' }]);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, { text: 'There was an error connecting to the AI. Please try again later.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <Lightbulb className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">AI Assistant</h3>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2" />
            <p>Ask me anything about your studies!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-xl max-w-[80%] ${msg.sender === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="relative mt-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows="1"
          className="w-full p-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          className="absolute right-3 bottom-3 text-indigo-500 hover:text-indigo-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

// --- StudyRooms Component ---
const StudyRooms = ({ db, userId }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomMessages, setRoomMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const roomsCollectionRef = db ? collection(db, `artifacts/${appId}/public/data/study_rooms`) : null;
  const messagesCollectionRef = currentRoom ? collection(db, `artifacts/${appId}/public/data/study_rooms/${currentRoom.id}/messages`) : null;

  useEffect(() => {
    if (roomsCollectionRef) {
      const unsubscribe = onSnapshot(roomsCollectionRef, (snapshot) => {
        const fetchedRooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(fetchedRooms);
      }, (error) => {
        console.error("Error fetching rooms: ", error);
      });
      return () => unsubscribe();
    }
  }, [roomsCollectionRef]);

  useEffect(() => {
    if (messagesCollectionRef) {
      const q = query(messagesCollectionRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
        setRoomMessages(fetchedMessages);
      }, (error) => {
        console.error("Error fetching messages: ", error);
      });
      return () => unsubscribe();
    }
  }, [messagesCollectionRef]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (newRoomName.trim() === '') return;
    try {
      if (roomsCollectionRef) {
        await addDoc(roomsCollectionRef, {
          name: newRoomName,
          createdAt: serverTimestamp(),
          ownerId: userId
        });
        setNewRoomName('');
      }
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };

  const handleJoinRoom = (room) => {
    setCurrentRoom(room);
    setRoomMessages([]);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !messagesCollectionRef) return;
    try {
      await addDoc(messagesCollectionRef, {
        text: newMessage,
        senderId: userId,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col h-[80vh]">
      <div className="flex items-center mb-4">
        <Users className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">Study Rooms</h3>
      </div>
      <div className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-4">
        Your User ID: <span id="userId" data-tooltip-id="userIdTip" className="font-bold text-gray-700 dark:text-gray-200 cursor-pointer">{userId}</span>
        <ReactTooltip id="userIdTip" place="top" effect="solid" className="font-sans">
          Click to copy your User ID for friends
        </ReactTooltip>
      </div>

      {!currentRoom ? (
        <>
          <form onSubmit={handleCreateRoom} className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Create a new study room..."
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
          <ul className="flex-1 overflow-y-auto space-y-2">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <li
                  key={room.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleJoinRoom(room)}
                >
                  <span className="font-medium">{room.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{room.ownerId === userId ? ' (My Room)' : ''}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleJoinRoom(room); }} className="text-indigo-500 font-semibold text-sm">Join</button>
                </li>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p>No study rooms found. Create one above!</p>
              </div>
            )}
          </ul>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold">{currentRoom.name}</h4>
            <button onClick={handleLeaveRoom} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200">Leave Room</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {roomMessages.length > 0 ? (
              roomMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[80%] ${msg.senderId === userId
                      ? 'bg-indigo-500 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                      }`}
                  >
                    <span className="font-bold text-xs block mb-1">{msg.senderId === userId ? 'You' : msg.senderId}</span>
                    {msg.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Bell className="w-12 h-12 mx-auto mb-2" />
                <p>Welcome to the study room! Say hello!</p>
              </div>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="flex space-x-2 mt-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;

