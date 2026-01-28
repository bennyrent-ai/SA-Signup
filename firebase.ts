
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { Signup } from '../types';

/**
 * CONFIGURATION:
 * Real Firebase config from your project.
 */
const firebaseConfig = {
  apiKey: "AIzaSyCqYwPITsr4VbKvS6e_lV5KXKEzNU",
  authDomain: "sa-signup-sp26.firebaseapp.com",
  projectId: "sa-signup-sp26",
  storageBucket: "sa-signup-sp26.firebasestorage.app",
  messagingSenderId: "139301431576",
  appId: "1:139301431576:web:cdf079acce6ad50d67566d",
  measurementId: "G-NL7CYHNY72"
};

// Check if the user has provided real config values
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey !== "";

let db: any = null;
let signupsCollection: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    signupsCollection = collection(db, 'signups');
  } catch (e) {
    console.error("Firebase initialization failed", e);
  }
}

// --- Local Storage Fallback Logic ---
const LOCAL_STORAGE_KEY = 'sa_signup_standalone_data';

const getLocalData = (): Signup[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalData = (data: Signup[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

export const isStandalone = () => !isFirebaseConfigured;

// --- Unified API ---

export const saveSignup = async (signupData: Omit<Signup, 'timestamp'>) => {
  if (isFirebaseConfigured && signupsCollection) {
    return await addDoc(signupsCollection, {
      ...signupData,
      timestamp: serverTimestamp()
    });
  } else {
    // Standalone implementation
    const current = getLocalData();
    const newEntry: Signup = {
      ...signupData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: { toDate: () => new Date() } // Simulate Firestore timestamp
    };
    saveLocalData([newEntry, ...current]);
    return newEntry;
  }
};

export const fetchAllSignups = async (): Promise<Signup[]> => {
  if (isFirebaseConfigured && signupsCollection) {
    const q = query(signupsCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Signup));
  } else {
    // Standalone implementation
    return getLocalData();
  }
};

export const deleteSignup = async (id: string) => {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'signups', id);
    await deleteDoc(docRef);
  } else {
    // Standalone implementation
    const current = getLocalData();
    saveLocalData(current.filter(s => s.id !== id));
  }
};
