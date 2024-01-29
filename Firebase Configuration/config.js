import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyCW5q9LsjOhiz9bAaP4Tdf700h5vJS-TLo",
  authDomain: "bloging-website-huzaifa.firebaseapp.com",
  projectId: "bloging-website-huzaifa",
  storageBucket: "bloging-website-huzaifa.appspot.com",
  messagingSenderId: "191297338441",
  appId: "1:191297338441:web:bd3299c8620e88a35dd398"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage();

export {
  app, auth, createUserWithEmailAndPassword, db, collection, addDoc, setDoc, onAuthStateChanged, signOut, signInWithEmailAndPassword, doc, getDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, updateDoc, getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  storage
}