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
} from "./Firebase Configuration/config.js";

const getUserData = (id) => {
  console.log(id);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    getUserData(user.uid);
    if (
      location.pathname !== "/user/dashboard.html" &&
      location.pathname !== "/user/home.html"
    ) {
      location.href = "/user/dashboard.html";
    }
  } else {
    if (location.pathname !== "/SignUp/signup.html" && location.pathname !== "/Login/login.html" && location.pathname !== "/index.html" && location.pathname !== "/allBlogs.html" && location.pathname !== "/") {
      location.href = "/Login/login.html";
    }
  }
});

const signupBtn = document.getElementById("signupBtn");
const confirmPasswordInp = document.getElementById("confirmPasswordInp");
const loaderDiv = document.querySelector(".loaderDiv");

function displayLoader() {
  loaderDiv.style.display = "flex";
  document.body.style.overflowY = "hidden";
}

function removeLoader() {
  loaderDiv.style.display = "none";
  document.body.style.overflowY = "scroll";
}

signupBtn &&
  signupBtn.addEventListener("click", () => {
    displayLoader();
    const firstNameInp = document.getElementById("firstNameInp");
    const lastNameInp = document.getElementById("lastNameInp");
    const emailInp = document.getElementById("emailInp");
    const passowrdInp = document.getElementById("passowrdInp");

    if (
      firstNameInp.value == "" &&
      lastNameInp.value == "" &&
      emailInp.value == "" &&
      passowrdInp.value == ""
    ) {
      removeLoader();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill all fields!",
      });
    } else if (firstNameInp.value == "") {
      removeLoader();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please first name field!",
      });
      location.href = "#firstNameInp";
    } else if (lastNameInp.value == "") {
      removeLoader();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please last name field!",
      });
      location.href = "#lastNameInp";
    } else if (emailInp.value == "") {
      removeLoader();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please email field!",
      });
      location.href = "#emailInp";
    } else if (passowrdInp.value == "") {
      removeLoader();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please password field!",
      });
      location.href = "#passowrdInp";
    } else if (confirmPasswordInp.value == "") {
      removeLoader();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please confirm password field!",
      });
      location.href = "#confirmPasswordInp";
    } else {
      if (confirmPasswordInp.value == passowrdInp.value) {
        const userData = {
          firstName: firstNameInp.value,
          lastName: lastNameInp.value,
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

confirmPasswordInp &&
  confirmPasswordInp.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      signupBtn.click();
    }
  });

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn && logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {    
  })
});
