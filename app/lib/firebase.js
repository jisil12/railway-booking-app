import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAY2N4_8618dDVV_RU3eQ1kg3m4v4dt-3g",
  authDomain: "tester-ark.firebaseapp.com",
  projectId: "tester-ark",
  storageBucket: "tester-ark.appspot.com",
  messagingSenderId: "482637758194",
  appId: "1:482637758194:web:17db380eb9f3e4c4605a6b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "railway");
