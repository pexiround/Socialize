import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

// --- PROFILE LINK HELPER ---
function displayShareLink(uid) {
    const section = document.getElementById('share-section');
    const urlText = document.getElementById('share-url');
    if (section && urlText) {
        section.classList.remove('hidden');
        const link = `${window.location.origin}/Socialize/index.html?u=${uid}`;
        urlText.innerText = link;
    }
}

// --- AUTH OBSERVER (For Managing Profile) ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        // If we're in the editor, try to fetch existing data
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            displayShareLink(user.uid);
        }
    }
});

// --- LOGIN ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = './editor.html';
        } catch (e) { console.error(e); }
    };
}

// --- SAVE / UPDATE ---
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return alert("Please log in again!");

        const name = document.getElementById('edit-name').value;
        const bio = document.getElementById('edit-bio').value;

        try {
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                bio: bio,
                avatar: user.photoURL,
                uid: user.uid
            });
            displayShareLink(user.uid);
            alert("Profile Saved!");
        } catch (e) {
            console.error(e);
            alert("Save failed! Double-check your Firestore Rules.");
        }
    };
}

// --- PROFILE VIEWER ---
const urlParams = new URLSearchParams(window.location.search);
const profileId = urlParams.get('u');
if (profileId && document.getElementById('profile-view')) {
    const landing = document.getElementById('landing-view');
    if (landing) landing.style.display = 'none';

    const docSnap = await getDoc(doc(db, "users", profileId));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('profile-view').classList.remove('hidden');
        document.getElementById('user-name').innerText = data.name;
        document.getElementById('user-bio').innerText = data.bio;
        document.getElementById('user-photo').src = data.avatar;
    }
}
