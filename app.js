import {
  app,
  auth,
  createUserWithEmailAndPassword,
} from "./Firebase Configuration/config.js";

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

signupBtn.addEventListener("click", () => {
  displayLoader();
  const firstNameInp = document.getElementById("firstNameInp");
  const lastNameInp = document.getElementById("lastNameInp");
  const emailInp = document.getElementById("emailInp");
  const passowrdInp = document.getElementById("passowrdInp");

  if (confirmPasswordInp.value == passowrdInp.value) {
    const userData = {
      firstName: firstNameInp.value,
      lastName: lastNameInp.value,
      email: emailInp.value,
      password: passowrdInp.value,
    };

    createUserWithEmailAndPassword(auth, userData.email, userData.password)
      .then((userCredential) => {
        const user = userCredential.user;
        removeLoader();
      })
      .catch((error) => {
        removeLoader();
        const errorCode = error.code;
        const errorMessage = errorCode.slice(5).toUpperCase();
        const errMessage = errorMessage.replace(/-/g, " ");
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: errMessage,
        });
      });
  } else {
    removeLoader();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please Confirm your Password!",
    });
    location.href = "#confirmPasswordInp";
  }
});

confirmPasswordInp.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    signupBtn.click();
  }
});
