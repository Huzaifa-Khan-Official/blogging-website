import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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


export {app, auth, createUserWithEmailAndPassword, db, collection, addDoc, doc, setDoc, onAuthStateChanged, signOut }