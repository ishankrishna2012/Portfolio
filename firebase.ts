// Firebase functionality is mocked for this demo environment to ensure
// the application runs without needing valid API keys immediately.
// In a real deployment, uncomment the imports and config below.

import { AccessLog } from './types';

// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

/* 
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
*/

// --- MOCK LOGGING SERVICE (LocalStorage based for Demo) ---

export const logLoginAttempt = async (email: string, status: 'SUCCESS' | 'FAILURE') => {
  try {
    // 1. Fetch IP Address
    let ip = 'Unknown';
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ip = data.ip;
    } catch (e) {
        console.warn("Could not fetch IP");
    }

    const logEntry: AccessLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      email,
      ip,
      status,
      userAgent: navigator.userAgent
    };

    // 2. Save to Firestore (Simulated)
    // await addDoc(collection(db, "access_logs"), logEntry);
    
    // Saving to LocalStorage for demo persistence
    const existing = JSON.parse(localStorage.getItem('access_logs') || '[]');
    localStorage.setItem('access_logs', JSON.stringify([logEntry, ...existing]));
    
    console.log("Logged attempt:", logEntry);
  } catch (error) {
    console.error("Logging failed:", error);
  }
};

export const getAccessLogs = async (): Promise<AccessLog[]> => {
  // Firestore Implementation:
  // const q = query(collection(db, "access_logs"), orderBy("timestamp", "desc"), limit(50));
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessLog));

  // LocalStorage Implementation:
  return JSON.parse(localStorage.getItem('access_logs') || '[]');
};

export const auth = {
  currentUser: null
};

export const db = {};