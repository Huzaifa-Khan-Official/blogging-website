import {
  app,
  auth,
  createUserWithEmailAndPassword,
  db,
  collection,
  addDoc,
  doc,
  setDoc,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  getDoc,
} from "../Firebase Configuration/config.js";

const loaderDiv = document.querySelector(".loaderDiv");

function displayLoader() {
  loaderDiv.style.display = "flex";
  document.body.style.overflowY = "hidden";
}

function removeLoader() {
  loaderDiv.style.display = "none";
  document.body.style.overflowY = "scroll";
}

const signupBtn = document.getElementById("signupBtn");
const confirmPasswordInp = document.getElementById("confirmPasswordInp");
let isUser = false;


onAuthStateChanged(auth, (user) => {
  if (user) {
    const docRef = doc(db, "user", user.uid);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        isUser = true;
        location.href = "/user/dashboard.html";
      }
    });
  }
});

signupBtn.addEventListener("click", () => {
  displayLoader();
  const firstNameInp = document.getElementById("firstNameInp");
  const lastNameInp = document.getElementById("lastNameInp");
  const emailInp = document.getElementById("emailInp");
  const passowrdInp = document.getElementById("passowrdInp");

  if (
    firstNameInp.value == "" ||
    lastNameInp.value == "" ||
    emailInp.value == "" ||
    passowrdInp.value == ""
  ) {
    removeLoader();
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Please fill all fields!",
    });
  } else {
    if (confirmPasswordInp.value == passowrdInp.value) {
      const firstName = firstNameInp.value.toUpperCase();
      const lastName = lastNameInp.value.toUpperCase();
      const name = `${firstName} ${lastName}`;

      const userData = {
        name: name,
        email: emailInp.value,
        password: passowrdInp.value,
      };

      createUserWithEmailAndPassword(auth, userData.email, userData.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          await setDoc(doc(db, "user", user.uid), {
            ...userData,
            userId: user.uid,
          });
          removeLoader();
          isUser = true;
          location.href = "../user/dashboard.html";
        })
        .catch((error) => {
          removeLoader();
          const errorCode = error.code;
          const errorMessage = error.message;
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage,
          });
        });
    } else {
      removeLoader();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please Confirm your Password!",
      });
      location.href = "#confirmPasswordInp";
    }
  }
});

confirmPasswordInp.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    signupBtn.click();
  }
});