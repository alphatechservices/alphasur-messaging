import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDFYPIXF8WDbrdwwkZ76qj1h20rtFEV8cQ",
  authDomain: "alphasur243-5838f.firebaseapp.com",
  databaseURL: "https://alphasur243-5838f-default-rtdb.firebaseio.com",
  projectId: "alphasur243-5838f",
  storageBucket: "alphasur243-5838f.firebasestorage.app",
  messagingSenderId: "292257432380",
  appId: "1:292257432380:web:d5419a575b702e579f5439",
  measurementId: "G-LVNXMHM1R1"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth };
