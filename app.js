import { initializeApp } from "https://www.gstatic.com/firebasejs/10/app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10/firebase-firestore.js";

// Your Firebase configuration from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyCNl7BW60B6GrHrGx02QaiUbZU3Z3oYlXM",
  authDomain: "socialize-614d2.firebaseapp.com",
  projectId: "socialize-614d2",
  storageBucket: "socialize-614d2.firebasestorage.app",
  messagingSenderId: "506436447388",
  appId: "1:506436447388:web:c8d876b69ed57048981159",
  measurementId: "G-Z5E41M8VCV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- 1. LOGIN LOGIC (For index.html) ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = 'editor.html'; // Go to editor after login
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login failed. Make sure Google Auth is enabled in Firebase!");
        }
    };
}

// --- 2. EDITOR LOGIC (For editor.html) ---
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    // When the user saves their info
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (user) {
            const name = document.getElementById('edit-name').value;
            const bio = document.getElementById('edit-bio').value;
            
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                bio: bio,
                avatar: user.photoURL,
                uid: user.uid
            });
            
            const shareLink = `${window.location.origin}${window.location.pathname.replace('editor.html', 'index.html')}?u=${user.uid}`;
            document.getElementById('share-url').innerText = `Live at: ${shareLink}`;
            alert("Profile Socialized!");
        }
    };
}

// --- 3. DISPLAY LOGIC (For index.html profile view) ---
const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get('u');

if (profileId) {
    // Hide landing page, show profile
    const landing = document.getElementById('landing');
    const profile = document.getElementById('profile');
    if (landing) landing.classList.add('hidden');
    if (profile) profile.classList.remove('hidden');

    // Fetch data from Firestore
    const loadProfile = async () => {
        const docRef = doc(db, "users", profileId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('p-name').innerText = data.name;
            document.getElementById('p-bio').innerText = data.bio;
            document.getElementById('p-img').src = data.avatar;
        } else {
            document.getElementById('p-name').innerText = "User not found";
        }
    };
    loadProfile();
}
