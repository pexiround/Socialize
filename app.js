import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- 1. GLOBAL USER COUNTER (Home Page) ---
async function loadUserCount() {
    const counterEl = document.getElementById('global-counter');
    if (counterEl) {
        try {
            const snapshot = await getDocs(collection(db, "users"));
            counterEl.innerText = `${snapshot.size} PEOPLE SOCIALIZING`;
        } catch (e) { counterEl.innerText = "READY TO SOCIALIZE"; }
    }
}
loadUserCount();

// --- 2. AUTH OBSERVER (Editor Data Loading) ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            document.getElementById('theme-select').value = data.theme || "theme-midnight";
            showLink(user.uid);
        }
    }
});

function showLink(uid) {
    const section = document.getElementById('share-section');
    if (section) {
        section.classList.remove('hidden');
        document.getElementById('share-url').innerText = `${window.location.origin}/Socialize/index.html?u=${uid}`;
    }
}

// --- 3. LOGIN LOGIC ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = './editor.html';
        } catch (e) { console.error(e); }
    };
}

// --- 4. SAVE LOGIC (Unique Name + Theme + Views) ---
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return alert("Please log in!");

        const name = document.getElementById('edit-name').value.trim();
        const bio = document.getElementById('edit-bio').value;
        const theme = document.getElementById('theme-select').value;

        try {
            // Check if name is taken
            const q = query(collection(db, "users"), where("name", "==", name));
            const snap = await getDocs(q);
            let taken = false;
            snap.forEach(d => { if(d.id !== user.uid) taken = true; });

            if(taken) return alert("Name already taken! Choose another.");

            await setDoc(doc(db, "users", user.uid), {
                name, bio, theme,
                avatar: user.photoURL,
                uid: user.uid,
                updatedAt: new Date()
            }, { merge: true });

            alert("Identity Synced!");
            showLink(user.uid);
        } catch (e) { alert("Save Error! Check Firestore Rules."); }
    };
}

// --- 5. PROFILE VIEWER ---
const params = new URLSearchParams(window.location.search);
const uid = params.get('u');
if (uid && document.getElementById('profile-view')) {
    const landing = document.getElementById('landing-view');
    if (landing) landing.style.display = 'none';

    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        await updateDoc(userRef, { views: increment(1) });

        document.body.className = data.theme || "theme-midnight";
        document.getElementById('profile-view').classList.remove('hidden');
        document.getElementById('user-name').innerText = data.name;
        document.getElementById('user-bio').innerText = data.bio;
        document.getElementById('user-photo').src = data.avatar;
    }
}
