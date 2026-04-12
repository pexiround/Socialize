import { initializeApp } from "https://www.gstatic.com/firebasejs/10/app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNl7BW60B6GrHrGx02QaiUbZU3Z3oYlXM",
  authDomain: "socialize-614d2.firebaseapp.com",
  projectId: "socialize-614d2",
  storageBucket: "socialize-614d2.firebasestorage.app",
  messagingSenderId: "506436447388",
  appId: "1:506436447388:web:c8d876b69ed57048981159",
  measurementId: "G-Z5E41M8VCV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- LOGIN LOGIC ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = './editor.html';
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login failed! Check your Authorized Domains in Firebase.");
        }
    };
}

// --- SAVE LOGIC ---
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (user) {
            const name = document.getElementById('edit-name').value;
            const bio = document.getElementById('edit-bio').value;
            try {
                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    bio: bio,
                    avatar: user.photoURL,
                    uid: user.uid
                });
                document.getElementById('share-section').classList.remove('hidden');
                const shareLink = `${window.location.origin}/Socialize/index.html?u=${user.uid}`;
                document.getElementById('share-url').innerText = shareLink;
                alert("Profile Socialized!");
            } catch (e) {
                console.error("Save error:", e);
                alert("Error saving! Check Firestore rules.");
            }
        }
    };
}
