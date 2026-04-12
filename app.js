import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNl7BW60B6GrHrGx02QaiUbZU3Z3oYlXM",
  authDomain: "socialize-614d2.firebaseapp.com",
  projectId: "socialize-614d2",
  storageBucket: "socialize-614d2.firebasestorage.app",
  messagingSenderId: "506436447388",
  appId: "1:506436447388:web:c8d876b69ed57048981159"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Handle Profile Viewing
const params = new URLSearchParams(window.location.search);
const uid = params.get('u');
if (uid) {
    const landing = document.getElementById('landing-view');
    if (landing) landing.style.display = 'none';
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('profile-view').classList.remove('hidden');
        document.getElementById('user-name').innerText = data.name;
        document.getElementById('user-bio').innerText = data.bio;
        document.getElementById('user-photo').src = data.avatar;
    }
}

// Login logic
const btn = document.getElementById('login-btn');
if (btn) {
    btn.onclick = async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = './editor.html';
        } catch (err) {
            console.error(err);
            alert("Login failed! Ensure pexiround.github.io is an 'Authorized Domain' in Firebase Auth Settings.");
        }
    };
}
