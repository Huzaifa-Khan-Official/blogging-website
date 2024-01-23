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
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
} from "./Firebase Configuration/config.js";

const loaderDiv = document.querySelector(".loaderDiv");

let userId;

function displayLoader() {
  loaderDiv.style.display = "flex";
  document.body.style.overflowY = "hidden";
}

function removeLoader() {
  loaderDiv.style.display = "none";
  document.body.style.overflowY = "scroll";
}

if (location.pathname == "/user/home.html") {
  displayLoader();
}

const getUserData = async (id) => {
  const docRef = doc(db, "user", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // docSnap.data()
    if (location.pathname == "/user/home.html") {
      const userName = document.getElementById("userName");
      const emailInpt = document.getElementById("emailInpt");
      const firstName = docSnap
        .data()
        .firstName.replace(/\s/g, "")
        .toUpperCase();
      const lastName = docSnap.data().lastName.replace(/\s/g, "").toUpperCase();
      emailInpt.value = docSnap.data().email;
      userName.innerHTML = `${firstName} ${lastName}`;
      removeLoader();
    }
  } else {
    console.log("No such document!");
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    getUserData(userId);
    getAllBlogsOfCurrUser(userId);
    if (
      location.pathname !== "/user/dashboard.html" &&
      location.pathname !== "/user/home.html"
    ) {
      location.href = "/user/dashboard.html";
    }
  } else {
    if (
      location.pathname !== "/SignUp/signup.html" &&
      location.pathname !== "/Login/login.html" &&
      location.pathname !== "/index.html" &&
      location.pathname !== "/allBlogs.html" &&
      location.pathname !== "/"
    ) {
      location.href = "/Login/login.html";
    }
  }
});

const loginBtn = document.getElementById("loginBtn");
const lpassword = document.getElementById("lpassword");

loginBtn &&
  loginBtn.addEventListener("click", () => {
    try {
      displayLoader();
      const lemail = document.getElementById("lemail");

      if (lemail.value == "" && lpassword.value == "") {
        removeLoader();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill all fields!",
        });
      } else if (lemail.value == "") {
        removeLoader();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please email field!",
        });
      } else if (lpassword.value == "") {
        removeLoader();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please password field!",
        });
      } else {
        signInWithEmailAndPassword(auth, lemail.value, lpassword.value)
          .then((userCredential) => {
            const user = userCredential.user;
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
      }
    } catch (error) {
      const errorMessage = error.message;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  });

lpassword &&
  lpassword.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn &&
  logoutBtn.addEventListener("click", () => {
    displayLoader();
    signOut(auth).then(() => {});
  });

const pubBlgBtn = document.getElementById("pubBlgBtn");

pubBlgBtn &&
  pubBlgBtn.addEventListener("click", async () => {
    displayLoader();
    const blogTitle = document.getElementById("blogTitle");
    const blogDesc = document.getElementById("blogDesc");
    const time = new Date();

    const docRef = await addDoc(collection(db, `user/${userId}/blogs`), {
      title: blogTitle.value,
      description: blogDesc.value,
      time: time,
    });

    blogTitle.value = "";
    blogDesc.value = "";

    removeLoader();
    Swal.fire({
      icon: "success",
      title: "Congratulations",
      text: "Blog published successfully!",
    });
  });

const blogDesc = document.getElementById("blogDesc");
const blogCardMainDiv = document.querySelector(".blogCardMainDiv");

blogDesc &&
  blogDesc.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      pubBlgBtn.click();
    }
  });

const getAllBlogsOfCurrUser = (userId) => {
  blogCardMainDiv.innerHTML = "";
  const spinnerBorder = document.querySelector(".spinner-border");
  const noBlogDiv = document.querySelector(".noBlogDiv");

  const q = query(
    collection(db, `user/${userId}/blogs`),
    orderBy("time", "desc")
  );

  onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.size == 0) {
      spinnerBorder.style.display = "none";
      noBlogDiv.style.display = "block";
    }

    if (querySnapshot.size) {
      spinnerBorder.style.display = "none";
      noBlogDiv.style.display = "none";
    }

    querySnapshot.docChanges().forEach((blog) => {
      if (blog.type === "removed") {
        const dBlog = document.getElementById(blog.doc.id);
        dBlog.remove();
      } else if (blog.type === "modified") {
        const blogId = blog.doc.id;
        const ModifiedBlog = document.getElementById(blogId);        
        const blogTitle = blog.doc.data().title;
        const blogDesc = blog.doc.data().description;
        const time = blog.doc.data().time;

        ModifiedBlog.innerHTML = `
        <div class="blogCard">
                        <div class="blogDetailDiv">
                            <div class="blogImg">
                                <img src="../assets/user1Img.png" alt="">
                            </div>
                            <div class="blogDetail">
                                <div class="blogTitle">
                                    <h4>
                                        ${blogTitle}
                                    </h4>
                                </div>
                                <div class="publishDetail">
                                    <h6>
                                        Huzaifa Khan - ${time
                                          .toDate()
                                          .toDateString()}
                                    </h6>
                                </div>

                            </div>
                        </div>

                        <div class="blogDescDiv">
                            <p>
                            ${blogDesc}
                            </p>
                        </div>

                        <div class="editDelBtnDiv">
                            <button id="editBtn">
                                Edit
                            </button>
                            <button id="delBtn" onclick="delBLogFunc('${blogId}')">
                                Delete
                            </button>
                        </div>
                    </div>
        `;
      } else if (blog.type === "added") {
        const blogId = blog.doc.id;
        const blogTitle = blog.doc.data().title;
        const blogDesc = blog.doc.data().description;
        const time = blog.doc.data().time;
        blogCardMainDiv.innerHTML += `
        <div class="blogCardDiv" id="${blog.doc.id}">
                    <div class="blogCard">
                        <div class="blogDetailDiv">
                            <div class="blogImg">
                                <img src="../assets/user1Img.png" alt="">
                            </div>
                            <div class="blogDetail">
                                <div class="blogTitle">
                                    <h4>
                                        ${blogTitle}
                                    </h4>
                                </div>
                                <div class="publishDetail">
                                    <h6>
                                        Huzaifa Khan - ${time
                                          .toDate()
                                          .toDateString()}
                                    </h6>
                                </div>

                            </div>
                        </div>

                        <div class="blogDescDiv">
                            <p>
                            ${blogDesc}
                            </p>
                        </div>

                        <div class="editDelBtnDiv">
                            <button id="editBtn">
                                Edit
                            </button>
                            <button id="delBtn" onclick="delBLogFunc('${blogId}')">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
        `;
      }
    });
  });
};

window.delBLogFunc = async (id) => {
  await deleteDoc(doc(db, `user/${userId}/blogs`, id));
};
