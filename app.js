import { initializeApp } from "https://www.gstatic.com/firebasejs/10/app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10/firebase-firestore.js";

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

// 1. PROFILE VIEW LOGIC (Checks if someone is visiting a profile link)
const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get('u');

if (profileId) {
    document.getElementById('landing-view').classList.add('hidden');
    const userDoc = await getDoc(doc(db, "users", profileId));
    if (userDoc.exists()) {
        const data = userDoc.data();
        document.getElementById('profile-view').classList.remove('hidden');
        document.getElementById('user-name').innerText = data.name;
        document.getElementById('user-bio').innerText = data.bio;
        document.getElementById('user-photo').src = data.avatar;
    }
}

// 2. LOGIN LOGIC
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = './editor.html';
        } catch (e) {
            console.error(e);
            alert("Login error! Check your Authorized Domains.");
        }
    });
}

// 3. SAVE LOGIC (Runs only on editor.html)
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
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
            document.getElementById('share-section').classList.remove('hidden');
            const link = `${window.location.origin}/Socialize/index.html?u=${user.uid}`;
            document.getElementById('share-url').innerText = link;
            alert("Profile Socialized!");
        }
    });
}
