import React, { createContext, useState, useEffect, useContext } from "react";

// Create context once
export const DashboardContext = createContext();

// Robust hook: throws if used outside provider
export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return ctx;
}
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";


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

export function DashboardProvider({ children }) {
  // Shared state for all dashboard features
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activePanel, setActivePanel] = useState("dashboard");
  const [user, setUser] = useState(null);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
    return () => unsubscribe();
  }, []);

  // Real-time sync for tasks (example)
  useEffect(() => {
    if (!user) return;
    const unsub = db.collection("tasks").where("userId", "==", user.uid)
      .onSnapshot(snapshot => {
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    return () => unsub();
  }, [user]);

  // Example CRUD functions with Firebase
  const addTask = task => {
    if (!user) return;
    db.collection("tasks").add({ ...task, userId: user.uid });
  };
  const updateTask = (id, updates) => {
    db.collection("tasks").doc(id).update(updates);
  };
  const deleteTask = id => {
    db.collection("tasks").doc(id).delete();
  };

  // ...similar for events, goals, notes

  return (
    <DashboardContext.Provider value={{
      tasks, setTasks, addTask, updateTask, deleteTask,
      events, setEvents,
      goals, setGoals,
      notes, setNotes,
      activePanel, setActivePanel,
      user,
      auth,
      db
    }}>
      {children}
    </DashboardContext.Provider>
  );
}
