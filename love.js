
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
const themeToogle = document.querySelector(".themeToggle");
const promptInput = document.querySelector(".promptInput");
const promptButton = document.querySelector(".promptButton");
const checkButton = document.querySelector(".checkButton");
const loveLetter = document.getElementById("loveLetter");
const sendBtn = document.getElementById("sendBtn");


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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Logged in as:", user.email);
  } else {
    window.location.href = "login.html";
  }
});

let storedLetters = JSON.parse(localStorage.getItem("loveLetters")) || [];
console.log(storedLetters);

const messages = [
  `My dearest NAME, your smile is my favorite language.`,
  `My dearest NAME, your smile is my favorite hello.`,
  `NAME, I was thinking about you today and just had to write this. If kisses were my favorite songs, I'd have you on repeat all day long. I just can't get enough of you.
  You're the person I want to share every little thing with, from the silliest jokes to the quietest moments. You make my world so much brighter, and I'm so grateful to have you in my life.
  I'm already counting down the moments until I get to see you again. All my love`,
 `To NAME, the missing piece that makes my whole world make sense.`,
 `NAME, You are my favorite playlist—no skips, just perfect vibes.`,
 `NAME, Talking to you feels like my favorite cozy spot I never want to leave.`,
 `NAME, not to be dramatic but my day doesn't really start until I hear from you.`,
 `Whenever you smile, my heart does a little happy flip. It’s my favorite sight.`,
 `I think you're my happy surprise. I thought I knew where my story was going, but then... there was you.`,
 `If we were in a game, I'd always choose you as my teammate. (But if it's for the last cookie, all bets are off.)`,
 `NAME, forget the charts you're my #1, always.`,
];


let savedName = "";
let isFirstClick = true;

promptButton.addEventListener("click", () => {
  if (isFirstClick) {
    const currentValue = promptInput.value.trim();
    savedName = currentValue || "Love";
    isFirstClick = false;
  }
  const randomIndex = Math.floor(Math.random() * messages.length);
  const prompt = messages[randomIndex];
  const personalized = prompt.replace(/NAME/g, savedName); 
  promptInput.value = personalized;
  promptInput.focus();
});

const saveLoveLetter = async (content, recipientEmail) => {
  if(!currentUser){
    alert("You must be logged in!")
    return false;
  }
  try {
    const docRef = await addDoc(
      collection(db, "loveLetters"),
      {
        content: content,
        date: new Date().toLocaleString(),
        timestamp: new Date().getTime(),
        from: currentUser.email,
        to: recipientEmail,
        fromUserId: currentUser.uid
      }
    ); 
    console.log("Saved! ID:", docRef.id);
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

checkButton.addEventListener("click", async () => {
  const message = promptInput.value.trim();
  
  if (message.length === 0) {
    alert("Please write a letter first!");
    return;
  }
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
    <div style="
      background: white;
      padding: 30px;
      border-radius: 20px;
      max-width: 90%;
      width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
    ">
      <h2 style="
        margin: 0 0 10px 0;
        color: #764ba2;
        font-size: 24px;
        text-align: center;
      ">Send Love Letter 💌</h2>
      
      <p style="
        margin: 0 0 20px 0;
        color: #666;
        font-size: 14px;
        text-align: center;
      ">Who should receive this letter?</p>
      
      <input 
        type="email" 
        id="modalEmailInput" 
        placeholder="their-email@example.com"
        style="
          width: 100%;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 10px;
          font-size: 16px;
          box-sizing: border-box;
          margin-bottom: 20px;
          font-family: inherit;
        "
      />
      
      <div style="display: flex; gap: 10px;">
        <button id="modalSendBtn" style="
          flex: 1;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: transform 0.2s;
        ">Send Letter</button>
        
        <button id="modalCancelBtn" style="
          flex: 1;
          padding: 15px;
          background: #f0f0f0;
          color: #333;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: transform 0.2s;
        ">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  const emailInput = modal.querySelector("#modalEmailInput");
  const sendBtn = modal.querySelector("#modalSendBtn");
  const cancelBtn = modal.querySelector("#modalCancelBtn");
  emailInput.focus();
  sendBtn.addEventListener("mouseenter", () => {
    sendBtn.style.transform = "scale(1.05)";
  });
  sendBtn.addEventListener("mouseleave", () => {
    sendBtn.style.transform = "scale(1)";
  });
  
  cancelBtn.addEventListener("mouseenter", () => {
    cancelBtn.style.transform = "scale(1.05)";
  });
  cancelBtn.addEventListener("mouseleave", () => {
    cancelBtn.style.transform = "scale(1)";
  });
  sendBtn.addEventListener("click", async () => {
    const recipientEmail = emailInput.value.trim();
    
    if (!recipientEmail || !recipientEmail.includes("@")) {
      emailInput.style.borderColor = "red";
      emailInput.placeholder = "Please enter a valid email!";
      return;
    }
    
    document.body.removeChild(modal);
    
    const success = await saveLoveLetter(message, recipientEmail);
    
    if (success) {
      promptInput.value = "";
      
      const envelope = document.getElementById("envelope");
      envelope.style.display = "block";
      envelope.classList.remove("fly");
      envelope.offsetHeight;
      envelope.classList.add("fly");
      setTimeout(() => {
        envelope.style.display = "none";
      }, 2000);
    }
  });
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  emailInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });
});

(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("darkTheme", isDarkTheme);
  themeToogle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
})();
const toogleTheme = () => {
  console.log("here");
  const isDarkTheme = document.body.classList.toggle("darkTheme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");

  themeToogle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};
themeToogle.addEventListener("click", toogleTheme);
// const { jsPDF } = window.jspdf;
// document.getElementById("downloadBtn").addEventListener("click", function () {
//   const doc = new jsPDF();

//   doc.setFillColor(230, 230, 250);  
//   doc.rect(0, 0, 210, 297, 'F');  
//   doc.setDrawColor(150, 100, 200);
//   doc.setLineWidth(3);
//   doc.rect(10, 10, 190, 277);
//   doc.setTextColor(120, 40, 200);
//   doc.setFont("times", "bolditalic");
//   doc.setFontSize(28);
//   doc.text("💌 Your Love Letter 💌", 105, 30, { align: "center" });
//   doc.setDrawColor(200, 150, 230);
//   doc.setLineWidth(1);
//   doc.line(30, 40, 180, 40);
//   doc.setTextColor(50, 50, 50);
//   doc.setFont("times", "italic");
//   doc.setFontSize(14);
  
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const margin = 25;
//   const maxLineWidth = pageWidth - margin * 2;
//   const lines = doc.splitTextToSize(letter.content, maxLineWidth);
  
//   doc.text(lines, margin, 55);
//   doc.setFontSize(10);
//   doc.setFont("times", "normal");
//   doc.setTextColor(100, 100, 100);
//   doc.text(letter.date, 105, 280, { align: "center" });
//   doc.setTextColor(255, 100, 150);
//   doc.setFontSize(20);
//   doc.text("❤", 20, 280);
//   doc.text("❤", 190, 280);
//   doc.save("dreamcore_love_letter.pdf");
// });
