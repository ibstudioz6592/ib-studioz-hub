
import React, { useState, useEffect, useContext, useRef } from "react";
import "./App.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import LoginPage from './LoginPage.jsx';
import DashboardOverview from "./DashboardOverview.jsx";
import { DashboardProvider, DashboardContext, useDashboardContext } from "./DashboardContext.jsx";
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

library.add(fas);

const firebaseConfig = {
  apiKey: "AIzaSyDCmvA9sFCSc5r4ZuFUJuGdO1LDoW7rKao",
  authDomain: "student-portal-free.firebaseapp.com",
  projectId: "student-portal-free",
  storageBucket: "student-portal-free.appspot.com",
  messagingSenderId: "272865877510",
  appId: "1:272865877510:web:0875a2502ae55bbf9ead87"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

function Toast({ message, type, show }) {
  return (
    <div className={`toast${show ? ' show' : ''} ${type || 'success'}`}>{message}</div>
  );
}

function AppContent() {
  // Example state for dashboard counters
  const [materialsCount, setMaterialsCount] = useState("...");
  const [pyqsCount, setPyqsCount] = useState("...");
  const [seminarsCount, setSeminarsCount] = useState("...");
  const [creditsCount, setCreditsCount] = useState("...");
  const [streakCount, setStreakCount] = useState("...");
  const [hoursCount, setHoursCount] = useState("...");

  useEffect(() => {
    // Example: Load materials count from Firestore
    db.collection("notes").onSnapshot(snapshot => {
      setMaterialsCount(snapshot.size);
    });
    db.collection("pyqs").onSnapshot(snapshot => {
      setPyqsCount(snapshot.size);
    });
    db.collection("seminars").onSnapshot(snapshot => {
      setSeminarsCount(snapshot.size);
    });
    // ...other Firestore listeners for credits, streak, hours
  }, []);

  const { activePanel, setActivePanel } = useContext(DashboardContext);
  const [toast, setToast] = useState({ message: "", type: "success", show: false });
  const toastTimeout = useRef();

  function showToast(message, type = "success") {
    setToast({ message, type, show: true });
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }
  return (
    <div className="App">
      <header className="page-header">
        <a href="/studentdashboard.html" className="brand-logo">
          <svg className="header-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFD700" d="M50,2 A48,48 0 1,0 50,98 A48,48 0 1,0 50,2 Z" />
            <g fill="#0A0A0A">
              <path d="M28,25 h10 v50 h-10 Z" />
              <path d="M45,25 H60 A12.5,12.5 0 0,1 60,50 H45 Z M45,50 H63 A12.5,12.5 0 0,1 63,75 H45 Z" />
            </g>
          </svg>
          <h1 className="brand-title">IB STUDIOZ</h1>
        </a>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div className="theme-toggle" id="theme-toggle">
            <FontAwesomeIcon icon={["fas", "moon"]} />
            <span>Dark</span>
          </div>
          <button id="profile-btn" className="btn-secondary">
            <FontAwesomeIcon icon={["fas", "user"]} /> Profile
          </button>
          <button id="logout-btn" className="btn-secondary">
            <FontAwesomeIcon icon={["fas", "sign-out-alt"]} /> Logout
          </button>
        </div>
      </header>
      <div className="container">
        <nav className="feature-tabs">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "planner", label: "Planner" },
            { key: "tasks", label: "Tasks" },
            { key: "analytics", label: "Analytics" },
            { key: "goals", label: "Goals" },
            { key: "social", label: "Social" },
            { key: "quiz", label: "Quiz Maker" },
            { key: "mindmap", label: "Mind Map" },
            { key: "notes", label: "Notes" },
            { key: "rooms", label: "Study Rooms" },
            { key: "badges", label: "Badges" },
            { key: "resume", label: "Resume" },
            { key: "ai", label: "AI Assistant" }
          ].map(tab => (
            <button
              key={tab.key}
              className={"feature-tab" + (activePanel === tab.key ? " active" : "")}
              onClick={() => setActivePanel(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        {activePanel === "dashboard" && (
          <DashboardOverview
            materialsCount={materialsCount}
            pyqsCount={pyqsCount}
            seminarsCount={seminarsCount}
            creditsCount={creditsCount}
            streakCount={streakCount}
            hoursCount={hoursCount}
          />
        )}
        {activePanel === "planner" && <Planner showToast={showToast} />}
        {activePanel === "tasks" && <TaskManager showToast={showToast} />}
        {activePanel === "analytics" && <Analytics />}
        {activePanel === "goals" && <Goals showToast={showToast} />}
        {activePanel === "social" && <SocialLearning />}
        {activePanel === "quiz" && <QuizMaker showToast={showToast} />}
        {activePanel === "mindmap" && <MindMap showToast={showToast} />}
        {activePanel === "notes" && <CollaborativeNotes showToast={showToast} />}
        {activePanel === "rooms" && <StudyRooms showToast={showToast} />}
        {activePanel === "badges" && <Badges />}
        {activePanel === "resume" && <ResumeBuilder showToast={showToast} />}
        {activePanel === "ai" && <AIAssistant showToast={showToast} />}
        <Toast {...toast} />
      </div>
    </div>
  );
}

function App() {
  const { user } = useDashboardContext();
  // If not authenticated, show login page
  if (!user) {
    return <LoginPage />;
  }
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}

export default App;
