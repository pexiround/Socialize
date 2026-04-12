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

// --- AUTO-LOAD DATA FOR MANAGING PROFILE ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Fill the boxes with your saved info so you can edit it
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            
            // Show your link immediately since you already have one
            showLink(user.uid);
        }
    }
});

function showLink(uid) {
    const shareSection = document.getElementById('share-section');
    const shareUrl = document.getElementById('share-url');
    if (shareSection && shareUrl) {
        shareSection.classList.remove('hidden');
        shareUrl.innerText = `${window.location.origin}/Socialize/index.html?u=${uid}`;
    }
}

// --- LOGIN LOGIC ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = './editor.html';
        } catch (err) { console.error(err); }
    };
}

// --- SAVE / UPDATE LOGIC ---
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return alert("Login first!");

        const nameInput = document.getElementById('edit-name').value;
        const bioInput = document.getElementById('edit-bio').value;

        try {
            await setDoc(doc(db, "users", user.uid), {
                name: nameInput,
                bio: bioInput,
                avatar: user.photoURL,
                uid: user.uid
            });
            showLink(user.uid);
            alert("Profile Updated!");
        } catch (e) {
            alert("Save failed! Check Firestore Rules.");
        }
    };
}

// --- VIEW PROFILE LOGIC ---
const params = new URLSearchParams(window.location.search);
const uid = params.get('u');
if (uid && document.getElementById('profile-view')) {
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
