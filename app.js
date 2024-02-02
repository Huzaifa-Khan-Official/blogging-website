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
  updateDoc,
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  storage,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "./Firebase Configuration/config.js";

const loaderDiv = document.querySelector(".loaderDiv");
const userImg = document.getElementById("userImg");
const userEmail = document.getElementById("userEmail");

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
    if (location.pathname == "/user/home.html") {
      const userNameInp = document.getElementById("userNameInp");
      const emailInpt = document.getElementById("emailInpt");
      const userId = document.getElementById("userId");

      if (docSnap.data().image) {
        userImg.src = docSnap.data().image;
      }
      emailInpt.value = docSnap.data().email;
      userId.value = docSnap.id;
      userNameInp.value = docSnap.data().name.toUpperCase();
      removeLoader();
    } else if (
      location.pathname == "/user/dashboard.html" ||
      location.pathname == "/user/index.html"
    ) {
      const userName = document.getElementById("userName");
      displayLoader();
      userName.innerHTML = docSnap.data().name.toUpperCase();
      removeLoader();
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Couldn't find your details!",
    });
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    getUserData(userId);
    getAllBlogsOfCurrUser(userId);
    if (
      location.pathname !== "/user/dashboard.html" &&
      location.pathname !== "/user/home.html" &&
      location.pathname !== "/user/index.html" &&
      location.pathname !== "/user/allBlogs.html"
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
    signOut(auth).then(() => { });
  });

const pubBlgBtn = document.getElementById("pubBlgBtn");

pubBlgBtn &&
  pubBlgBtn.addEventListener("click", async () => {
    displayLoader();
    const blogTitle = document.getElementById("blogTitle");
    const blogDesc = document.getElementById("blogDesc");
    const time = new Date();

    if (blogTitle.value == "" || blogDesc.value == "") {
      removeLoader();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill all fields!",
      });
    } else {
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
    }
  });

const blogCardMainDiv = document.querySelector(".blogCardMainDiv");


const getAllBlogsOfCurrUser = async () => {
  if (location.pathname == "/user/dashboard.html") {
    blogCardMainDiv.innerHTML = "";
    const spinnerBorder = document.querySelector(".spinner-border");
    const noBlogDiv = document.querySelector(".noBlogDiv");
    const user = auth.currentUser;
    const userId = user.uid;

    let imageUrl;
    const unsub = onSnapshot(doc(db, "user", userId), (doc) => {
      if (doc.data().image) {
        imageUrl = doc.data().image;
      }
    });

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

          ModifiedBlog.setAttribute("id", blogId);

          ModifiedBlog.innerHTML = `
                    <div class="blogCard">
                        <div class="blogDetailDiv">
                            <div class="blogImg">
                                <img src=${imageUrl ? imageUrl : "../assets/userIcon.png"
            } alt="">
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
                            <button data-bs-toggle="modal" data-bs-target="#editBlogModal" onclick="updBLogFunc('${blogId}')">
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
                                <img src=${imageUrl ? imageUrl : "../assets/userIcon.png"
            } alt="">
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
                            <button data-bs-toggle="modal" data-bs-target="#editBlogModal" onclick="updBLogFunc('${blogId}')">
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
  }
};

window.delBLogFunc = async (id) => {
  await deleteDoc(doc(db, `user/${userId}/blogs`, id));
};

const uptBlogTitle = document.getElementById("uptBlogTitle");
const uptBlogDesc = document.getElementById("uptBlogDesc");
const updBlgBtn = document.getElementById("updBlgBtn");

let updBlogId;
window.updBLogFunc = async (id) => {
  const blogRef = doc(db, `user/${userId}/blogs`, id);
  updBlogId = id;
  onSnapshot(blogRef, (selectBlog) => {
    if (selectBlog.exists()) {
      const EditBlogTitle = selectBlog.data().title;
      const EditBlogDesc = selectBlog.data().description;

      uptBlogTitle.value = EditBlogTitle;
      uptBlogDesc.value = EditBlogDesc;
    }
  });
};

updBlgBtn &&
  updBlgBtn.addEventListener("click", async () => {
    try {
      $("#editBlogModal").modal("hide");
      displayLoader();
      if (uptBlogTitle.value == "" || uptBlogDesc.value == "") {
        removeLoader();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill all fields!",
        });
      } else {
        const updBlogRef = doc(db, `user/${userId}/blogs`, updBlogId);
        const time = new Date();

        await updateDoc(updBlogRef, {
          title: uptBlogTitle.value,
          description: uptBlogDesc.value,
          time: time,
        });

        $("#editBlogModal").modal("hide");
        removeLoader();

        uptBlogTitle.value = "";
        uptBlogDesc.value = "";

        Swal.fire({
          icon: "success",
          title: "Congratulations",
          text: "Blog updated successfully!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong! Please try again later.",
      });
    }
  });

const getAllBlogs = () => {
  if (location.pathname == "/user/index.html") {
    blogCardMainDiv.innerHTML = "";

    const spinnerBorder = document.querySelector(".spinner-border");

    const q = collection(db, `user`);

    onSnapshot(q, (querySnapshot) => {
      querySnapshot.docChanges().forEach(async (currUser) => {
        const userId = currUser.doc.data().userId;
        const userName = currUser.doc.data().name;

        let imageUrl;

        imageUrl = currUser.doc.data().image;

        const q = query(
          collection(db, `user/${userId}/blogs`),
          orderBy("time", "desc")
        );

        onSnapshot(q, (querySnapshot) => {
          if (querySnapshot.size == 0) {
            spinnerBorder.style.display = "none";
          }

          if (querySnapshot.size) {
            spinnerBorder.style.display = "none";
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

              ModifiedBlog.setAttribute("id", blogId);

              ModifiedBlog.innerHTML = `
                        <div class="blogCard">
                            <div class="blogDetailDiv">
                                <div class="blogImg">
                                    <img src=${imageUrl
                  ? imageUrl
                  : "../assets/userIcon.png"
                } alt="">
                                </div>
                                <div class="blogDetail">
                                    <div class="blogTitle">
                                        <h4>
                                            ${blogTitle}
                                        </h4>
                                    </div>
                                    <div class="publishDetail">
                                        <h6>
                                            ${userName} - ${time
                  .toDate()
                  .toDateString()}
                                        </h6>
                                    </div>
    
                                </div>
                            </div>
    
                            <div class="blogDescDiv">
                                <p>
                                ${blogDesc.slice(0, 500)}....
                                </p>
                            </div>
    
                            <div class="allFromThisUserDiv">
                              <a href="./allBlogs.html?userId=${userId}">see all from this user</a>                              
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
                                    <img src=${imageUrl
                  ? imageUrl
                  : "../assets/userIcon.png"
                } alt="">
                                </div>
                                <div class="blogDetail">
                                    <div class="blogTitle">
                                        <h4>
                                            ${blogTitle}
                                        </h4>
                                    </div>
                                    <div class="publishDetail">
                                        <h6>
                                            ${userName} - ${time
                  .toDate()
                  .toDateString()}
                                        </h6>
                                    </div>
    
                                </div>
                            </div>
    
                            <div class="blogDescDiv">
                                <p>
                                ${blogDesc.slice(0, 500)}....
                                </p>
                            </div>
    
                            <div class="allFromThisUserDiv">
                              <a href="./allBlogs.html?userId=${userId}">see all from this user</a>                                   
                            </div>
                        </div>
                    </div>
            `;
            }
          });
        });
      });
    });
  } else if (location.pathname == "/index.html") {
    blogCardMainDiv.innerHTML = "";

    const spinnerBorder = document.querySelector(".spinner-border");
    const noBlogDiv = document.querySelector(".noBlogDiv");

    const q = collection(db, `user`);

    onSnapshot(q, (querySnapshot) => {
      querySnapshot.docChanges().forEach((currUser) => {
        const userId = currUser.doc.data().userId;
        const userName = currUser.doc.data().name.toUpperCase();

        let imageUrl;

        imageUrl = currUser.doc.data().image;

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

              ModifiedBlog.setAttribute("id", blogId);

              ModifiedBlog.innerHTML = `
                        <div class="blogCard">
                            <div class="blogDetailDiv">
                                <div class="blogImg">
                                    <img src=${imageUrl
                  ? imageUrl
                  : "../assets/userIcon.png"
                } alt="">
                                </div>
                                <div class="blogDetail">
                                    <div class="blogTitle">
                                        <h4>
                                            ${blogTitle}
                                        </h4>
                                    </div>
                                    <div class="publishDetail">
                                        <h6>
                                          ${userName} - ${time
                  .toDate()
                  .toDateString()}
                                        </h6>
                                    </div>
    
                                </div>
                            </div>
    
                            <div class="blogDescDiv">
                                <p>
                                ${blogDesc.slice(0, 500)}....
                                </p>
                            </div>
    
                            <div class="allFromThisUserDiv">
                              <a href="./allBlogs.html?userId=${userId}">see all from this user</a>
                            </div>
                        </div>
                      `;
            } else if (blog.type === "added") {
              const blogId = blog.doc.id;
              const blogTitle = blog.doc.data().title;
              const blogDesc = blog.doc.data().description;
              const time = blog.doc.data().time;
              blogCardMainDiv.innerHTML += `
            <div class="blogCardDiv" id="${blogId}">
                        <div class="blogCard">
                            <div class="blogDetailDiv">
                                <div class="blogImg">
                                    <img src=${imageUrl
                  ? imageUrl
                  : "../assets/userIcon.png"
                } alt="">
                                </div>
                                <div class="blogDetail">
                                    <div class="blogTitle">
                                        <h4>
                                            ${blogTitle}
                                        </h4>
                                    </div>
                                    <div class="publishDetail">
                                        <h6>
                                          ${userName} - ${time
                  .toDate()
                  .toDateString()}
                                        </h6>
                                    </div>
    
                                </div>
                            </div>
    
                            <div class="blogDescDiv">
                                <p>
                                ${blogDesc.slice(0, 500)}....
                                </p>
                            </div>
    
                            <div class="allFromThisUserDiv">
                              <a href="./allBlogs.html?userId=${userId}">see all from this user</a>
                            </div>
                        </div>
                    </div>
            `;
            }
          });
        });
      });
    });
  }
};

if (
  location.pathname == "/index.html" ||
  location.pathname == "/user/index.html"
) {
  getAllBlogs();
}

const uptBtn = document.getElementById("uptBtn");
const userImgInp = document.getElementById("userImgInp");

const downloadImageUrl = (file) => {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    const userImgRef = ref(
      storage,
      // storage location
      `usersImages/${user.uid}`
    );
    const uploadTask = uploadBytesResumable(userImgRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case "paused":
            break;
          case "running":
            break;
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            resolve(downloadURL);
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
};

const updatePasswordFunc = (oldPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    const currentUser = auth.currentUser;
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      oldPassword
    );
    reauthenticateWithCredential(currentUser, credential)
      .then(() => {
        updatePassword(currentUser, newPassword)
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

uptBtn &&
  uptBtn.addEventListener("click", async () => {
    try {
      displayLoader();

      const oldPassword = document.getElementById("oldPassword");
      const newPassword = document.getElementById("newPassword");

      if (oldPassword.value && newPassword.value) {
        await updatePasswordFunc(oldPassword.value, newPassword.value);
      }

      const userNameInp = document.getElementById("userNameInp");
      const userId = document.getElementById("userId");

      const user = {
        name: userNameInp.value.toUpperCase(),
      };

      if (userImgInp.files[0]) {
        user.image = await downloadImageUrl(userImgInp.files[0]);
      }

      const userRef = doc(db, `user/${userId.value}`);

      await updateDoc(userRef, user);

      removeLoader();

      Swal.fire({
        icon: "success",
        title: "Congratulations",
        text: "Profile updated successfully!",
      });
      userNameInp.value = userNameInp.value.toUpperCase();
      oldPassword.value = "";
      newPassword.value = "";
    } catch (error) {
      removeLoader();
      oldPassword.value = "";
      newPassword.value = "";
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
      });
    }
  });

const uptIconDiv = document.querySelector(".uptIconDiv");

userImgInp &&
  userImgInp.addEventListener("change", (e) => {
    const file = e.target.files[0];
    userImg.src = URL.createObjectURL(file);
  });

uptIconDiv &&
  uptIconDiv.addEventListener("click", () => {
    userImgInp.click();
  });


const getBlogsOfSelectedUser = async () => {
  displayLoader()
  const queryString = location.search;
  const urlParams = new URLSearchParams(queryString);
  const userId = urlParams.get("userId");

  const unsub = onSnapshot(doc(db, `user/${userId}`), (doc) => {
    const imageUrl = doc.data().image;
    const userNameValue = doc.data().name;
    const userEmailValue = doc.data().email;
    userName.innerHTML = userNameValue;

    userEmail.innerHTML = userEmailValue;
    userImg.src = imageUrl ? imageUrl : location.pathname == "/allBlogs.html" ? "./assets/userIcon.png" : "../assets/userIcon.png"

    const q = query(
      collection(db, `user/${userId}/blogs`),
      orderBy("time", "desc")
    );
    onSnapshot(q, (querySnapshot) => {

      if (querySnapshot.size == 0) {
        removeLoader()
      }

      if (querySnapshot.size) {
        removeLoader()
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

          ModifiedBlog.setAttribute("id", blogId);

          ModifiedBlog.innerHTML = `
                  <div class="blogCard">
                      <div class="blogDetailDiv">
                          <div class="blogImg">
                              <img src=${imageUrl ? imageUrl : location.pathname == "/allBlogs.html" ? "./assets/userIcon.png" : "../assets/userIcon.png"
            } alt="">
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
                              <img src=${imageUrl ? imageUrl : location.pathname == "/allBlogs.html" ? "./assets/userIcon.png" : "../assets/userIcon.png"
            } alt="">
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
                  </div>
              </div>
      `;
        }
      });
    })
  });
}

if (location.pathname == "/allBlogs.html") {
  getBlogsOfSelectedUser();
}

if (location.pathname == "/user/allBlogs.html") {
  getBlogsOfSelectedUser();
}