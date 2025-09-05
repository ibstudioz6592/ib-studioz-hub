import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp, setLogLevel } from 'firebase/firestore';
import {
  Sparkles, ListChecks, GraduationCap, Lightbulb, User, MessageSquare, Plus, Trash2, CheckCircle, Pencil, Send, Smile, Paperclip,
  CheckCircle2, XCircle, Users, Bell, Search, Star, MessageSquareDashed, Moon, Sun, Calendar, Settings, BookOpen, Target, Clock, Award,
  Edit, Save, X, Camera, Upload
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
  const [userProfile, setUserProfile] = useState({ displayName: '', photoURL: '', email: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({ displayName: '', bio: '' });

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
          setUserProfile({
            displayName: user.displayName || 'Student',
            photoURL: user.photoURL || '',
            email: user.email || '',
            bio: user.bio || ''
          });
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const startEditingProfile = () => {
    setTempProfile({
      displayName: userProfile.displayName,
      bio: userProfile.bio
    });
    setIsEditingProfile(true);
  };

  const saveProfile = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: tempProfile.displayName
        });
        
        // Update bio in Firestore (since it's not part of Firebase Auth profile)
        if (db) {
          const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`);
          await setDoc(userDocRef, {
            bio: tempProfile.bio,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
        
        setUserProfile({
          ...userProfile,
          displayName: tempProfile.displayName,
          bio: tempProfile.bio
        });
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this to Firebase Storage
      // For demo purposes, we'll just use a placeholder
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserProfile({
          ...userProfile,
          photoURL: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
    <div className={`min-h-screen font-inter transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <StudentDashboard 
        db={db} 
        auth={auth} 
        userId={userId} 
        userProfile={userProfile} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        signInWithGoogle={signInWithGoogle}
        handleSignOut={handleSignOut}
        isEditingProfile={isEditingProfile}
        startEditingProfile={startEditingProfile}
        saveProfile={saveProfile}
        cancelEditingProfile={cancelEditingProfile}
        tempProfile={tempProfile}
        setTempProfile={setTempProfile}
        handleProfilePhotoChange={handleProfilePhotoChange}
      />
    </div>
  );
};

// --- StudentDashboard Component ---
const StudentDashboard = ({ 
  db, 
  auth, 
  userId, 
  userProfile, 
  darkMode, 
  toggleDarkMode,
  signInWithGoogle,
  handleSignOut,
  isEditingProfile,
  startEditingProfile,
  saveProfile,
  cancelEditingProfile,
  tempProfile,
  setTempProfile,
  handleProfilePhotoChange
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const userGreeting = auth.currentUser?.isAnonymous ? 'Guest' : userProfile.displayName || 'Student';

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-8">
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
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-medium transition-colors duration-200 ${activeTab === 'planner' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            Planner
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
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-medium transition-colors duration-200 ${activeTab === 'profile' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            Profile
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-full transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-8 h-8 text-gray-500 dark:text-gray-300" />
              )}
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium">{userProfile.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userProfile.email || 'Anonymous'}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserMenu(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                >
                  <Settings className="inline mr-2 h-4 w-4" />
                  Settings
                </button>
                {auth.currentUser?.isAnonymous ? (
                  <button
                    onClick={() => {
                      signInWithGoogle();
                      setShowUserMenu(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    Sign in with Google
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowUserMenu(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    Sign out
                  </button>
                )}
              </div>
            )}
          </div>
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
            <Analytics db={db} userId={userId} />
            <StudyGoals db={db} userId={userId} />
            <RecentNotes db={db} userId={userId} />
          </div>
        )}
        {activeTab === 'tasks' && <TaskManager db={db} userId={userId} />}
        {activeTab === 'planner' && <Planner db={db} userId={userId} />}
        {activeTab === 'ai' && <AIAssistant />}
        {activeTab === 'study-rooms' && <StudyRooms db={db} userId={userId} />}
        {activeTab === 'profile' && (
          <UserProfile 
            userProfile={userProfile}
            isEditingProfile={isEditingProfile}
            startEditingProfile={startEditingProfile}
            saveProfile={saveProfile}
            cancelEditingProfile={cancelEditingProfile}
            tempProfile={tempProfile}
            setTempProfile={setTempProfile}
            handleProfilePhotoChange={handleProfilePhotoChange}
            auth={auth}
          />
        )}
      </main>
      
      <footer className="text-center mt-8 py-4 text-gray-500 text-sm border-t border-gray-200 dark:border-gray-700">
        &copy; 2025 Academic Hub. All rights reserved.
      </footer>
    </div>
  );
};

// --- UserProfile Component ---
const UserProfile = ({
  userProfile,
  isEditingProfile,
  startEditingProfile,
  saveProfile,
  cancelEditingProfile,
  tempProfile,
  setTempProfile,
  handleProfilePhotoChange,
  auth
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <User className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">User Profile</h3>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-4 border-indigo-500">
                <User className="h-16 w-16 text-gray-500 dark:text-gray-300" />
              </div>
            )}
            
            {isEditingProfile && (
              <label className="absolute bottom-0 right-0 bg-indigo-500 text-white p-2 rounded-full cursor-pointer">
                <Camera className="h-5 w-5" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleProfilePhotoChange}
                />
              </label>
            )}
          </div>
          
          <div className="text-center">
            {isEditingProfile ? (
              <input
                type="text"
                value={tempProfile.displayName}
                onChange={(e) => setTempProfile({...tempProfile, displayName: e.target.value})}
                className="text-xl font-bold text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-indigo-500 mb-2"
              />
            ) : (
              <h2 className="text-xl font-bold">{userProfile.displayName}</h2>
            )}
            <p className="text-gray-500 dark:text-gray-400">{userProfile.email || 'Anonymous User'}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">About Me</h3>
            {isEditingProfile ? (
              <textarea
                value={tempProfile.bio}
                onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                {userProfile.bio || 'No bio available. Click edit to add your bio.'}
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Account Information</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="mb-2">
                <span className="font-medium">User ID:</span> {auth.currentUser?.uid || 'N/A'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Email:</span> {userProfile.email || 'Anonymous'}
              </div>
              <div>
                <span className="font-medium">Account Type:</span> {auth.currentUser?.isAnonymous ? 'Anonymous' : 'Registered'}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {isEditingProfile ? (
              <>
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </button>
                <button
                  onClick={cancelEditingProfile}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center"
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={startEditingProfile}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- StudyGoals Component ---
const StudyGoals = ({ db, userId }) => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', targetDate: '', completed: false });
  const goalsCollectionRef = db ? collection(db, `artifacts/${appId}/users/${userId}/study_goals`) : null;

  useEffect(() => {
    if (goalsCollectionRef) {
      const q = query(goalsCollectionRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedGoals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGoals(fetchedGoals);
      }, (error) => {
        console.error("Error fetching goals: ", error);
      });
      return () => unsubscribe();
    }
  }, [goalsCollectionRef]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (newGoal.title.trim() === '') return;
    try {
      if (goalsCollectionRef) {
        await addDoc(goalsCollectionRef, {
          ...newGoal,
          createdAt: serverTimestamp(),
        });
        setNewGoal({ title: '', targetDate: '', completed: false });
      }
    } catch (error) {
      console.error("Error adding goal: ", error);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const goalDocRef = doc(db, `artifacts/${appId}/users/${userId}/study_goals/${id}`);
      await updateDoc(goalDocRef, { completed: !completed });
    } catch (error) {
      console.error("Error updating goal: ", error);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      const goalDocRef = doc(db, `artifacts/${appId}/users/${userId}/study_goals/${id}`);
      await deleteDoc(goalDocRef);
    } catch (error) {
      console.error("Error deleting goal: ", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 col-span-1">
      <div className="flex items-center mb-4">
        <Target className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">Study Goals</h3>
      </div>
      
      <form onSubmit={handleAddGoal} className="mb-4">
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="Set a study goal..."
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex space-x-2">
            <input
              type="date"
              value={newGoal.targetDate}
              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
      
      <ul className="space-y-3 max-h-60 overflow-y-auto">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <li
              key={goal.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${goal.completed ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 line-through' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => handleToggleComplete(goal.id, goal.completed)}
                  className="mr-2"
                >
                  {goal.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <span className="font-medium">{goal.title}</span>
                  {goal.targetDate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteGoal(goal.id)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            <Target className="w-8 h-8 mx-auto mb-2" />
            <p>No study goals yet. Add one above!</p>
          </div>
        )}
      </ul>
    </div>
  );
};

// --- RecentNotes Component ---
const RecentNotes = ({ db, userId }) => {
  const [notes, setNotes] = useState([]);
  const notesCollectionRef = db ? collection(db, `artifacts/${appId}/users/${userId}/notes`) : null;

  useEffect(() => {
    if (notesCollectionRef) {
      const q = query(notesCollectionRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()).slice(0, 3);
        setNotes(fetchedNotes);
      }, (error) => {
        console.error("Error fetching notes: ", error);
      });
      return () => unsubscribe();
    }
  }, [notesCollectionRef]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 col-span-1">
      <div className="flex items-center mb-4">
        <BookOpen className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">Recent Notes</h3>
      </div>
      
      <ul className="space-y-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <li key={note.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium truncate">{note.title}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{note.content.substring(0, 60)}...</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {note.createdAt?.toDate().toLocaleDateString()}
              </div>
            </li>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <p>No notes yet. Create notes in the Planner!</p>
          </div>
        )}
      </ul>
    </div>
  );
};

// --- TaskManager Component (Enhanced) ---
const TaskManager = ({ db, userId }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [taskPriority, setTaskPriority] = useState('medium');
  const tasksCollectionRef = db ? collection(db, `artifacts/${appId}/users/${userId}/tasks`) : null;

  useEffect(() => {
    if (tasksCollectionRef) {
      const q = query(tasksCollectionRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(fetchedTasks.sort((a, b) => {
          // Sort by priority first, then by completion status, then by creation date
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          return a.createdAt?.toDate() - b.createdAt?.toDate();
        }));
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
          priority: taskPriority,
          createdAt: serverTimestamp(),
        });
        setNewTaskText('');
        setTaskPriority('medium');
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
    setTaskPriority(task.priority || 'medium');
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    try {
      const taskDocRef = doc(db, `artifacts/${appId}/users/${userId}/tasks/${editingTask.id}`);
      await updateDoc(taskDocRef, { 
        text: newTaskText,
        priority: taskPriority
      });
      setEditingTask(null);
      setNewTaskText('');
      setTaskPriority('medium');
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 col-span-1 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <ListChecks className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">My To-Do List</h3>
      </div>
      
      <form onSubmit={editingTask ? handleUpdateTask : handleAddTask} className="flex flex-col space-y-2 mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder={editingTask ? "Edit task..." : "Add a new task..."}
            className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            type="submit"
            className="p-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200"
          >
            {editingTask ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
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
                <div>
                  <span>{task.text}</span>
                  {task.priority && (
                    <span className={`ml-2 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  )}
                </div>
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

// --- Analytics Component (Enhanced) ---
const Analytics = ({ db, userId }) => {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [gpa, setGpa] = useState(0);

  useEffect(() => {
    if (db) {
      const tasksCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/tasks`);
      const q = query(tasksCollectionRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const allTasks = snapshot.docs.map(doc => doc.data());
        setCompletedTasks(allTasks.filter(task => task.completed).length);
        setTotalTasks(allTasks.length);
      }, (error) => {
        console.error("Error fetching tasks: ", error);
      });
      
      // In a real app, you would fetch actual study time and GPA data
      // For demo purposes, we'll use mock data
      setStudyTime(12); // hours
      setGpa(3.7);
      
      return () => unsubscribe();
    }
  }, [db, userId]);

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 col-span-1">
      <div className="flex items-center mb-4">
        <Sparkles className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">Your Progress</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-4xl font-bold text-indigo-500">{completedTasks}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tasks Completed</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-4xl font-bold text-purple-500">{completionPercentage}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completion Rate</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-4xl font-bold text-green-500">{studyTime}h</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Study Time</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-4xl font-bold text-yellow-500">{gpa.toFixed(1)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">GPA</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium mb-2">Achievements</h4>
        <div className="flex space-x-2">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <Award className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Star className="h-6 w-6 text-blue-500" />
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Planner Component (Enhanced) ---
const Planner = ({ db, userId }) => {
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [activeTab, setActiveTab] = useState('events');
  const eventsCollectionRef = db ? collection(db, `artifacts/${appId}/users/${userId}/planner_events`) : null;
  const notesCollectionRef = db ? collection(db, `artifacts/${appId}/users/${userId}/notes`) : null;

  useEffect(() => {
    if (eventsCollectionRef) {
      const q = query(eventsCollectionRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedEvents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
        setEvents(fetchedEvents);
      }, (error) => {
        console.error("Error fetching events: ", error);
      });
      return () => unsubscribe();
    }
  }, [eventsCollectionRef]);

  useEffect(() => {
    if (notesCollectionRef) {
      const q = query(notesCollectionRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
        setNotes(fetchedNotes);
      }, (error) => {
        console.error("Error fetching notes: ", error);
      });
      return () => unsubscribe();
    }
  }, [notesCollectionRef]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (newEvent.title.trim() === '' || newEvent.date === '') return;
    try {
      if (eventsCollectionRef) {
        await addDoc(eventsCollectionRef, {
          ...newEvent,
          createdAt: serverTimestamp(),
        });
        setNewEvent({ title: '', date: '', time: '' });
      }
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const eventDocRef = doc(db, `artifacts/${appId}/users/${userId}/planner_events/${id}`);
      await deleteDoc(eventDocRef);
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (newNote.title.trim() === '' || newNote.content.trim() === '') return;
    try {
      if (notesCollectionRef) {
        await addDoc(notesCollectionRef, {
          ...newNote,
          createdAt: serverTimestamp(),
        });
        setNewNote({ title: '', content: '' });
      }
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const noteDocRef = doc(db, `artifacts/${appId}/users/${userId}/notes/${id}`);
      await deleteDoc(noteDocRef);
    } catch (error) {
      console.error("Error deleting note: ", error);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <Calendar className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">My Planner</h3>
      </div>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 font-medium ${activeTab === 'events' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 font-medium ${activeTab === 'notes' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Notes
        </button>
      </div>
      
      {activeTab === 'events' ? (
        <>
          <form onSubmit={handleAddEvent} className="flex flex-col space-y-2 mb-4">
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Event title..."
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex space-x-2">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                min={today}
                className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          <ul className="flex-1 overflow-y-auto space-y-2">
            {events.length > 0 ? (
              events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <span className="font-semibold">{event.title}</span>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {event.date} {event.time}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Calendar className="w-12 h-12 mx-auto mb-2" />
                <p>No events scheduled. Add one above!</p>
              </div>
            )}
          </ul>
        </>
      ) : (
        <>
          <form onSubmit={handleAddNote} className="flex flex-col space-y-2 mb-4">
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="Note title..."
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              placeholder="Note content..."
              rows={3}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200 self-end"
            >
              <Plus className="w-5 h-5 inline mr-1" /> Add Note
            </button>
          </form>
          
          <ul className="flex-1 overflow-y-auto space-y-3">
            {notes.length > 0 ? (
              notes.map((note) => (
                <li
                  key={note.id}
                  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{note.title}</h4>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">{note.content}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {note.createdAt?.toDate().toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors ml-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-2" />
                <p>No notes yet. Add one above!</p>
              </div>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

// --- AIAssistant Component (Enhanced) ---
const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, { role: 'user', parts: [{ text: input }] }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const systemPrompt = "You are a helpful study assistant named 'Sparky'. Provide concise and encouraging answers to student queries. If asked to write code, provide it directly without extra conversational text. If asked about real-time data, state that you cannot access it.";
      const userQuery = input;
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [...conversationHistory, { role: 'user', parts: [{ text: userQuery }] }],
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
        setConversationHistory(prev => [...prev, { role: 'model', parts: [{ text }] }]);
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

  const clearConversation = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Lightbulb className="h-6 w-6 text-indigo-500 mr-2" />
          <h3 className="text-xl font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={clearConversation}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors"
        >
          Clear Conversation
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2" />
            <p>Ask me anything about your studies!</p>
            <div className="mt-4 text-sm">
              <p>Try asking:</p>
              <ul className="mt-2 space-y-1">
                <li className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg inline-block">"Explain quantum physics simply"</li>
                <li className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg inline-block">"Help me plan my study schedule"</li>
                <li className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg inline-block">"Give me tips for better focus"</li>
              </ul>
            </div>
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

// --- StudyRooms Component (Enhanced) ---
const StudyRooms = ({ db, userId }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomMessages, setRoomMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomMembers, setRoomMembers] = useState([]);
  const roomsCollectionRef = db ? collection(db, `artifacts/${appId}/public/data/study_rooms`) : null;
  const messagesCollectionRef = currentRoom ? collection(db, `artifacts/${appId}/public/data/study_rooms/${currentRoom.id}/messages`) : null;
  const membersCollectionRef = currentRoom ? collection(db, `artifacts/${appId}/public/data/study_rooms/${currentRoom.id}/members`) : null;

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

  useEffect(() => {
    if (membersCollectionRef) {
      const unsubscribe = onSnapshot(membersCollectionRef, (snapshot) => {
        const fetchedMembers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoomMembers(fetchedMembers);
      }, (error) => {
        console.error("Error fetching members: ", error);
      });
      return () => unsubscribe();
    }
  }, [membersCollectionRef]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (newRoomName.trim() === '') return;
    try {
      if (roomsCollectionRef) {
        const newRoomRef = await addDoc(roomsCollectionRef, {
          name: newRoomName,
          createdAt: serverTimestamp(),
          ownerId: userId
        });
        
        // Add the creator as a member
        const membersRef = collection(db, `artifacts/${appId}/public/data/study_rooms/${newRoomRef.id}/members`);
        await addDoc(membersRef, {
          userId: userId,
          joinedAt: serverTimestamp()
        });
        
        setNewRoomName('');
      }
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };

  const handleJoinRoom = async (room) => {
    setCurrentRoom(room);
    setRoomMessages([]);
    
    // Add user as a member if not already
    if (membersCollectionRef) {
      const q = query(membersCollectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        await addDoc(membersCollectionRef, {
          userId: userId,
          joinedAt: serverTimestamp()
        });
      }
    }
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

  const copyUserIdToClipboard = () => {
    navigator.clipboard.writeText(userId).then(() => {
      console.log('User ID copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const inviteToRoom = () => {
    const roomLink = `${window.location.origin}?room=${currentRoom.id}`;
    navigator.clipboard.writeText(roomLink).then(() => {
      alert('Room link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col h-[80vh]">
      <div className="flex items-center mb-4">
        <Users className="h-6 w-6 text-indigo-500 mr-2" />
        <h3 className="text-xl font-semibold">Study Rooms</h3>
      </div>
      
      <div className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-4">
        Your User ID: <span id="userId" data-tooltip-id="userIdTip" className="font-bold text-gray-700 dark:text-gray-200 cursor-pointer" onClick={copyUserIdToClipboard}>{userId}</span>
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
                  <div className="flex items-center">
                    <span className="font-medium">{room.name}</span>
                    <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                      {room.ownerId === userId ? 'My Room' : 'Public'}
                    </span>
                  </div>
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
            <div>
              <h4 className="text-lg font-bold">{currentRoom.name}</h4>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Users className="w-4 h-4 mr-1" /> {roomMembers.length} members
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={inviteToRoom} className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 text-sm">
                Invite
              </button>
              <button onClick={handleLeaveRoom} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200">Leave</button>
            </div>
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
                    <span className="font-bold text-xs block mb-1">{msg.senderId === userId ? 'You' : msg.senderId.substring(0, 8)}</span>
                    {msg.text}
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
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
