import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc,  addDoc,  doc, updateDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Logged in as:", user.email);
    updateLetters();
  } else {
    window.location.href = "login.html";
  }
});

const lettersList = document.getElementById("lettersList");

const searchInput = document.getElementById("searchInput");
let letters = [];  
async function loadLettersFromFirebase() {
  if (!currentUser) return [];
  
  try {
    const q = query(
      collection(db, "loveLetters"), 
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const letters = [];
    
    querySnapshot.forEach((doc) => {
      const letterData = doc.data();
      if (letterData.to === currentUser.email) {
        letters.push({
          id: doc.id,
          ...letterData
        });
      }
    });
    
    return letters;
  } catch (error) {
    console.error("Error loading letters:", error);
    return [];
  }
}

async function updateLetters() {
  letters = await loadLettersFromFirebase();
  
  lettersList.innerHTML = "";
  if (letters.length === 0) {
    lettersList.innerHTML = "<p>No love letters yet 💔</p>";
    return;
  }
  
  letters.forEach((letter, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("letter-entry");
    wrapper.innerHTML = `
        <div class="bottons">
        <br>
            <button class="tooltip edit-btn">
                <i class="fa-solid fa-pencil"></i>
                <span class="tooltip-text">Reply</span>
            </button>
            <button class="tooltip delete-btn">
                <i class="fa-solid fa-trash-can"></i>
                <span class="tooltip-text">Delete</span>
            </button>
            <button class="tooltip downloadButton">
                <i class="fa-solid fa-download"></i>
                <span class="tooltip-text">Download</span>
            </button>
        </div>
        <div class="letter-info" style="font-size: 12px; color: #666; margin-bottom: 10px;">
          From: <strong>${letter.from || "Unknown"}</strong>
        </div>
        <p class="diary">${letter.content}</p>
        <p class="conlent"><strong>${letter.date}</strong></p>
        <hr/>
    `;
    lettersList.appendChild(wrapper);
   wrapper.querySelector(".delete-btn").addEventListener("click", () => {
  // Create delete confirmation modal
  const deleteModal = document.createElement("div");
  deleteModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  deleteModal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 20px;
      max-width: 90%;
      width: 400px;
      text-align: center;
      animation: slideUp 0.3s ease;
    ">
      <div style="
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        color: white;
        font-size: 32px;
      ">🗑️</div>
      
      <h2 style="margin: 0 0 10px 0; color: #333;">Delete Letter?</h2>
      <p style="color: #666; margin-bottom: 25px;">
        This love letter will be permanently deleted. This action cannot be undone.
      </p>
      
      <div style="display: flex; gap: 10px;">
        <button id="confirmDelete" style="
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        ">Delete Forever</button>
        
        <button id="cancelDelete" style="
          flex: 1;
          padding: 12px;
          background: #f0f0f0;
          color: #333;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        ">Keep It</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(deleteModal);
  
  deleteModal.querySelector("#confirmDelete").addEventListener("click", async () => {
    try {
      await deleteDoc(doc(db, "loveLetters", letter.id));
      document.body.removeChild(deleteModal);
      showNotification("Letter deleted", "error");
      await updateLetters();
    } catch (error) {
      console.error("Error deleting:", error);
      document.body.removeChild(deleteModal);
      showNotification("Failed to delete", "error");
    }
  });
  
  deleteModal.querySelector("#cancelDelete").addEventListener("click", () => {
    document.body.removeChild(deleteModal);
  });
  
  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      document.body.removeChild(deleteModal);
    }
  });
});
    

wrapper.querySelector(".edit-btn").addEventListener("click", async () => {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
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
        from { transform: translateY(30px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .reply-success {
        animation: pulse 0.5s ease;
      }
    </style>
    <div style="
      background: white;
      padding: 30px;
      border-radius: 20px;
      max-width: 90%;
      width: 500px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
      position: relative;
    ">
      <button id="closeModal" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        color: #888;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">×</button>
      
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          color: white;
          font-size: 24px;
        ">💌</div>
        <h2 style="
          margin: 0 0 10px 0;
          color: #333;
          font-size: 24px;
        ">Reply to ${letter.from}</h2>
        <p style="
          margin: 0;
          color: #666;
          font-size: 14px;
        ">Write your sweet response...</p>
      </div>
      
      <div style="
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 20px;
        border-radius: 15px;
        margin-bottom: 20px;
        border-left: 4px solid #764ba2;
      ">
        <p style="
          margin: 0;
          font-style: italic;
          color: #555;
          line-height: 1.6;
        ">"${letter.content.substring(0, 100)}${letter.content.length > 100 ? '...' : ''}"</p>
      </div>
      
      <textarea 
        id="replyTextarea" 
        placeholder="Type your reply here..."
        style="
          width: 100%;
          min-height: 120px;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 20px;
          box-sizing: border-box;
          transition: all 0.3s;
        "
      ></textarea>
      
      <div style="display: flex; gap: 10px;">
        <button id="sendReplyBtn" style="
          flex: 1;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <i class="fa-solid fa-paper-plane"></i>
          Send Reply
        </button>
        
        <button id="cancelReplyBtn" style="
          flex: 1;
          padding: 15px;
          background: #f0f0f0;
          color: #333;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s;
        ">Cancel</button>
      </div>
      
      <p id="replyStatus" style="
        margin: 15px 0 0 0;
        font-size: 14px;
        text-align: center;
        color: #666;
        min-height: 20px;
      "></p>
    </div>
  `;
  
  document.body.appendChild(modal);
  const replyTextarea = modal.querySelector("#replyTextarea");
  const sendBtn = modal.querySelector("#sendReplyBtn");
  const cancelBtn = modal.querySelector("#cancelReplyBtn");
  const closeBtn = modal.querySelector("#closeModal");
  const statusText = modal.querySelector("#replyStatus");
  replyTextarea.focus();
  replyTextarea.addEventListener("focus", () => {
    replyTextarea.style.borderColor = "#764ba2";
    replyTextarea.style.boxShadow = "0 0 0 3px rgba(118, 75, 162, 0.1)";
  });
  
  replyTextarea.addEventListener("blur", () => {
    replyTextarea.style.borderColor = "#e0e0e0";
    replyTextarea.style.boxShadow = "none";
  });
  sendBtn.addEventListener("mouseenter", () => {
    sendBtn.style.transform = "translateY(-2px)";
    sendBtn.style.boxShadow = "0 5px 15px rgba(118, 75, 162, 0.4)";
  });
  
  sendBtn.addEventListener("mouseleave", () => {
    sendBtn.style.transform = "translateY(0)";
    sendBtn.style.boxShadow = "none";
  });
  
  cancelBtn.addEventListener("mouseenter", () => {
    cancelBtn.style.transform = "translateY(-2px)";
    cancelBtn.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
  });
  
  cancelBtn.addEventListener("mouseleave", () => {
    cancelBtn.style.transform = "translateY(0)";
    cancelBtn.style.boxShadow = "none";
  });
  const sendReply = async () => {
    const reply = replyTextarea.value.trim();
    
    if (!reply) {
      statusText.textContent = "Please write something!";
      statusText.style.color = "#ff4757";
      replyTextarea.style.borderColor = "#ff4757";
      setTimeout(() => {
        statusText.textContent = "";
        replyTextarea.style.borderColor = "#e0e0e0";
      }, 2000);
      return;
    }
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    sendBtn.style.opacity = "0.7";
    
    try {
      await addDoc(collection(db, "loveLetters"), {
        content: reply,
        date: new Date().toLocaleString(),
        timestamp: new Date().getTime(),
        from: currentUser.email,
        to: letter.from,
        fromUserId: currentUser.uid,
        isReply: true,
        originalLetterId: letter.id
      });
      await updateDoc(doc(db, "loveLetters", letter.id), {
        replied: true,
        repliedAt: new Date().toLocaleString()
      });
      sendBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sent!';
      sendBtn.style.background = "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)";
      sendBtn.classList.add("reply-success");
      statusText.textContent = "Reply sent successfully! 💌";
      statusText.style.color = "#00b09b";
      setTimeout(async () => {
        document.body.removeChild(modal);
        await updateLetters();
        showNotification("Reply sent! 💌", "success");
      }, 1500);
      
    } catch (error) {
      console.error("Error sending reply:", error);
      sendBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Failed';
      sendBtn.style.background = "linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)";
      sendBtn.disabled = false;
      sendBtn.style.opacity = "1";
      statusText.textContent = "Failed to send reply 💔";
      statusText.style.color = "#ff4757";
      setTimeout(() => {
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Reply';
        sendBtn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        sendBtn.disabled = false;
        sendBtn.style.opacity = "1";
        statusText.textContent = "";
      }, 2000);
    }
  };
  sendBtn.addEventListener("click", sendReply);
  replyTextarea.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      sendReply();
    }
  });
  const closeModal = () => {
    modal.style.animation = "fadeIn 0.3s ease reverse";
    modal.querySelector("div").style.animation = "slideUp 0.3s ease reverse";
    setTimeout(() => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
    }, 250);
  };
  
  cancelBtn.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
});
    wrapper.querySelector(".downloadButton").addEventListener("click", function () {
   showThemeSelector(letter);
});
  });
}
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' : 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)'};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    z-index: 10001;
    animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  `;
  
  notification.innerHTML = `
    <i class="fa-solid ${type === "success" ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      document.body.removeChild(notification);
    }
  }, 3000);
}



updateLetters();

searchInput.addEventListener("input", async () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  const allLetters = await loadLettersFromFirebase();
  
  if (searchTerm === "") {
    letters = allLetters;
  } else {
    letters = allLetters.filter(letter => 
      letter.content.toLowerCase().includes(searchTerm) ||
      letter.date.toLowerCase().includes(searchTerm)
    );
  }
  
  displayFilteredLetters();
});
function displayFilteredLetters() {
  lettersList.innerHTML = "";
  
  if (letters.length === 0) {
    lettersList.innerHTML = "<p>No letters found 💔</p>";
    return;
  }
  
  letters.forEach((letter) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("letter-entry");
    wrapper.innerHTML = `
        <div class="bottons">
        <br>
            <button class="tooltip edit-btn">
                <i class="fa-solid fa-pencil"></i>
                <span class="tooltip-text">Reply</span>
            </button>
            <button class="tooltip delete-btn">
                <i class="fa-solid fa-trash-can"></i>
                <span class="tooltip-text">Delete</span>
            </button>
            <button class="tooltip downloadButton">
                <i class="fa-solid fa-download"></i>
                <span class="tooltip-text">Download</span>
            </button>
        </div>
        <p class="diary">${letter.content}</p>
        <p class="conlent"><strong>${letter.date}</strong></p>
        <hr/>
    `;
    lettersList.appendChild(wrapper);
    
    wrapper.querySelector(".delete-btn").addEventListener("click", async () => {
      try {
        await deleteDoc(doc(db, "loveLetters", letter.id));
        searchInput.value = "";
        await updateLetters();
      } catch (error) {
        console.error("Error deleting:", error);
        showNotification("Failed to delete 💔", "error");
      }
    });
    
    wrapper.querySelector(".edit-btn").addEventListener("click", async () => {
      const reply = prompt("Write your reply:");
      if (reply === null || reply.trim() === "") return;
      try {
        await updateDoc(doc(db, "loveLetters", letter.id), {
          reply: reply.trim(),
          repliedAt: new Date()
        });
        searchInput.value = "";
        await updateLetters();
      } catch (error) {
        console.error("Error sending reply:", error);
          showNotification("Failed to send reply 💔", "error");
      }
    });

    
    

  });
}
function convertEmojiToEmoticon(text) {
  const emojiMap = {
    "❤️": "<3",
    "💖": "*<3*",
    "💕": "<3",
    "😍": "<3_<3",
    "🥰": "<3",
    "😊": ":)",
    "😁": ":)",
    "😂": ":D",
    "😭": "T_T",
    "🥺": ":(",
    "😔": ":(",
    "😢": ":'(",
    "😘": ";)",
    "😉": ";)",
    '✨': '*',
     '⭐': '*', 
     '🌟': '*', 
     '💫': '*', 
     '⚡': '!',
     '💯': '100',
      '👍': '+1', 
      '👎': '-1',
      '✌️': 'V',
       '✌': 'V', 
       '🤞': 'x',
        '🙏': '><',
        
  
  };

 return text.replace(/\p{Extended_Pictographic}/gu, match =>
    emojiMap[match] || ""
  );
}
const pdfThemes = {
  dreamcore: {
    name: "Dreamcore",
    emoji: "💜",
    background: [230, 230, 250],
    border: [150, 100, 200],
    accent: [255, 100, 150],
    textColor: [50, 50, 50],
    titleColor: [120, 40, 200],
    title: "<3 Your Love Letter <3",
    decorLeft: "<3",
    decorRight: "*"
  },
  valentine: {
    name: "Valentine's",
    emoji: "💗",
    background: [255, 240, 245],
    border: [220, 20, 60],
    accent: [255, 105, 180],
    textColor: [80, 20, 40],
    titleColor: [200, 0, 50],
    title: "With All My Heart",
    decorLeft: "<3",
    decorRight: "<3"
  },
  midnight: {
    name: "Midnight",
    emoji: "🌙",
    background: [25, 25, 50],
    border: [100, 149, 237],
    accent: [255, 215, 0],
    textColor: [240, 240, 255],
    titleColor: [255, 215, 0],
    title: "Under the Stars",
    decorLeft: "*",
    decorRight: "*"
  },
  cherry: {
    name: "Cherry Blossom",
    emoji: "🌸",
    background: [255, 250, 250],
    border: [255, 182, 193],
    accent: [219, 112, 147],
    textColor: [100, 50, 70],
    titleColor: [200, 100, 130],
    title: "In Full Bloom",
    decorLeft: "~",
    decorRight: "~"
  },
  fairy: {
    name: "Fairy Tale",
    emoji: "✨",
    background: [255, 253, 208],
    border: [218, 165, 32],
    accent: [147, 112, 219],
    textColor: [70, 50, 30],
    titleColor: [180, 140, 50],
    title: "Once Upon a Time",
    decorLeft: "*",
    decorRight: "+"
  }
};
function showThemeSelector(letter) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    padding: 20px;
    box-sizing: border-box;
    animation: fadeIn 0.3s ease;
    font-family: "Tektur", sans-serif;
  `;
  
  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      
      .theme-selector-container {
        background: linear-gradient(135deg, #fff8e7 0%, #fff0f6 100%);
        padding: 25px 20px;
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 15px 40px rgba(209, 123, 136, 0.3);
        animation: slideUp 0.4s ease;
        position: relative;
        border: 2px solid #f3d6ad;
        color: #d17b88;
      }
      
      /* Custom scrollbar to match your design */
      .theme-selector-container::-webkit-scrollbar {
        width: 10px;
      }
      
      .theme-selector-container::-webkit-scrollbar-track {
        background: #ffe6ea;
        border-radius: 10px;
        margin: 5px;
      }
      
      .theme-selector-container::-webkit-scrollbar-thumb {
        background: #ff9aa2;
        border-radius: 10px;
        border: 2px solid #ffe6ea;
      }
      
      .theme-selector-container::-webkit-scrollbar-thumb:hover {
        background: #ff6f91;
      }
      
      .theme-close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: #ffccd5;
        border: none;
        font-size: 24px;
        color: #fff;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
        font-family: "Tektur", sans-serif;
        font-weight: 500;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
      }
      
      .theme-close-btn:hover {
        background: #ffb3bf;
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(109,40,217,0.3);
      }
      
      .theme-header {
        text-align: center;
        margin-bottom: 25px;
        padding-right: 40px;
      }
      
      .theme-header h2 {
        margin: 0 0 8px 0;
        color: #d17b88;
        font-size: 28px;
        font-family: "Tektur", sans-serif;
        text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
      }
      
      .theme-header p {
        margin: 0;
        color: #ff6f91;
        font-size: 14px;
        font-family: "Exo 2", sans-serif;
      }
      
      .theme-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .theme-card {
        border: 2px solid #f3d6ad;
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 15px;
        background: #fff;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.05);
      }
      
      .theme-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(209, 123, 136, 0.15);
        border-color: #ff99c8;
      }
      
      .theme-card.selected {
        border-color: #d17b88;
        background: linear-gradient(135deg, #fff0f6 0%, #ffe6ea 100%);
        box-shadow: 0 8px 20px rgba(209, 123, 136, 0.25);
        border-width: 3px;
      }
      
      .theme-icon {
        font-size: 32px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: linear-gradient(135deg, #fff8e7 0%, #fff0f6 100%);
        box-shadow: 0 2px 8px rgba(209, 123, 136, 0.1);
        flex-shrink: 0;
        border: 1px dashed #d8a7a7;
      }
      
      .theme-info {
        flex: 1;
      }
      
      .theme-name {
        font-weight: 600;
        font-size: 16px;
        color: #d17b88;
        margin: 0 0 4px 0;
        font-family: "Tektur", sans-serif;
      }
      
      .theme-desc {
        font-size: 13px;
        color: #ff6f91;
        margin: 0;
        font-family: "Exo 2", sans-serif;
      }
      
      .theme-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      
      .theme-btn {
        flex: 1;
        padding: 14px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: "Tektur", sans-serif;
        background-color: #ffccd5;
        color: #fff;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
      }
      
      .theme-btn-primary {
        background-color: #ffccd5;
        color: #fff;
      }
      
      .theme-btn-primary:hover {
        background-color: #ffb3bf;
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(109,40,217,0.3);
      }
      
      .theme-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      
      /* Mobile Responsive */
      @media (max-width: 600px) {
        .theme-selector-container {
          padding: 20px 15px;
          margin: 10px;
          max-height: 80vh;
        }
        
        .theme-header {
          padding-right: 0;
        }
        
        .theme-header h2 {
          font-size: 22px;
        }
        
        .theme-header p {
          font-size: 13px;
        }
        
        .theme-card {
          padding: 12px;
          gap: 12px;
        }
        
        .theme-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
        }
        
        .theme-name {
          font-size: 14px;
        }
        
        .theme-desc {
          font-size: 11px;
        }
        
        .theme-btn {
          padding: 12px;
          font-size: 14px;
        }
        
        .theme-close-btn {
          width: 35px;
          height: 35px;
          font-size: 20px;
          top: 10px;
          right: 10px;
        }
      }
    </style>
    
    <div class="theme-selector-container">
      <button class="theme-close-btn" id="closeThemeModal">×</button>
      
      <div class="theme-header">
        <h2>Choose Your Theme ✨</h2>
        <p>Select a style for your love letter PDF</p>
      </div>
      
      <div class="theme-grid">
        <div class="theme-card selected" data-theme="dreamcore">
          <div class="theme-icon">💜</div>
          <div class="theme-info">
            <p class="theme-name">Dreamcore</p>
            <p class="theme-desc">Purple dreamy vibes with hearts</p>
          </div>
        </div>
        
        <div class="theme-card" data-theme="valentine">
          <div class="theme-icon">💗</div>
          <div class="theme-info">
            <p class="theme-name">Valentine's</p>
            <p class="theme-desc">Classic red and pink romance</p>
          </div>
        </div>
        
        <div class="theme-card" data-theme="midnight">
          <div class="theme-icon">🌙</div>
          <div class="theme-info">
            <p class="theme-name">Midnight Romance</p>
            <p class="theme-desc">Dark blue with golden stars</p>
          </div>
        </div>
        
        <div class="theme-card" data-theme="cherry">
          <div class="theme-icon">🌸</div>
          <div class="theme-info">
            <p class="theme-name">Cherry Blossom</p>
            <p class="theme-desc">Soft pink floral elegance</p>
          </div>
        </div>
        
        <div class="theme-card" data-theme="fairy">
          <div class="theme-icon">✨</div>
          <div class="theme-info">
            <p class="theme-name">Fairy Tale</p>
            <p class="theme-desc">Golden magical story vibes</p>
          </div>
        </div>
      </div>
      
      <div class="theme-actions">
        <button class="theme-btn theme-btn-primary" id="downloadThemeBtn">
          <i class="fa-solid fa-download"></i>
          Download PDF
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  let selectedTheme = 'dreamcore';
  const themeCards = modal.querySelectorAll('.theme-card');
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedTheme = card.dataset.theme;
      card.style.animation = 'none';
      setTimeout(() => {
        card.style.animation = '';
      }, 10);
    });
  });
  modal.querySelector('#downloadThemeBtn').addEventListener('click', () => {
    generateThemedPDF(letter, selectedTheme);
    document.body.removeChild(modal);
    showNotification("PDF downloaded! 💌", "success");
  });
  modal.querySelector('#closeThemeModal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  document.addEventListener('keydown', function handleKeyPress(e) {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', handleKeyPress);
    }
  });
}
function generateThemedPDF(letter, themeName) {
  const theme = pdfThemes[themeName];
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFillColor(...theme.background);
  doc.rect(0, 0, 210, 297, "F");
  doc.setDrawColor(...theme.border);
  doc.setLineWidth(3);
  doc.rect(10, 10, 190, 277);
  doc.setTextColor(...theme.titleColor);
  doc.setFont("times");
  doc.setFontSize(20);
  doc.text(theme.title, 105, 20, { align: "center" });
  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(1);
  doc.line(30, 40, 180, 40);
  doc.setFontSize(10);
  for (let i = 55; i < 270; i += 20) {
    if (i % 40 === 15) {
      doc.setTextColor(...theme.accent);
      doc.text(theme.decorLeft, 18, i);
    } else {
      doc.setTextColor(...theme.border);
      doc.text(theme.decorRight, 18.5, i);
    }
    if (i % 40 === 15) {
      doc.setTextColor(...theme.border);
      doc.text(theme.decorRight, 188.5, i);
    } else {
      doc.setTextColor(...theme.accent);
      doc.text(theme.decorLeft, 188, i);
    }
  }
  doc.setTextColor(...theme.textColor);
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const maxLineWidth = pageWidth - margin * 2;
  const convertedContent = convertEmojiToEmoticon(letter.content);
  const lines = doc.splitTextToSize(convertedContent, maxLineWidth);
  
  const boxX = 25;
  const boxY = 55;
  const boxWidth = pageWidth - 50;
  const boxHeight = 150;
  const lightBg = theme.background.map(c => Math.min(c + 10, 255));
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...theme.accent);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 6, 6, "FD");
  
  const lineHeight = 8;
  const textHeight = lines.length * lineHeight;
  const startY = boxY + boxHeight / 2 - textHeight / 2 + lineHeight;
  
  doc.text(lines, pageWidth / 2, startY, {
    align: "center",
    maxWidth: boxWidth - 20
  });
  doc.setFontSize(12);
  const footerColor = theme.textColor.map(c => Math.min(c + 50, 200));
  doc.setTextColor(...footerColor);
  doc.text("— sent with reckless affection", pageWidth / 2, boxY + boxHeight + 18, {
    align: "center"
  });
  doc.setFontSize(10);
  doc.setFont("times", "normal");
  doc.text(letter.date, 105, 280, { align: "center" });
  doc.setTextColor(...theme.accent);
  doc.setFontSize(20);
  doc.text(theme.decorLeft, 20, 280);
  doc.text(theme.decorLeft, 190, 280);
  
  doc.save(`${theme.name.toLowerCase()}_love_letter.pdf`);
}