import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJhvnzFannAgA8NgkhFEg8gcN5-HCZsTk",
  authDomain: "lovediary-9fccb.firebaseapp.com",
  projectId: "lovediary-9fccb",
  storageBucket: "lovediary-9fccb.firebasestorage.app",
  messagingSenderId: "335580374798",
  appId: "1:335580374798:web:4b72dd8c275e76662b995f",
  measurementId: "G-DBNCDSS6XP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const errorMsg = document.getElementById("error");

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
}


signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showError("Please fill in all fields!");
    return;
  }
  
  if (password.length < 6) {
    showError("Password must be at least 6 characters!");
    return;
  }
  
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "love.html"; 
  } catch (error) {
    showError(error.message);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showError("Please fill in all fields!");
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "love.html"; 
  } catch (error) {
    showError("Wrong email or password!");
  }
});