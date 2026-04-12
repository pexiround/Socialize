import { initializeApp } from "https://www.gstatic.com/firebasejs/10/app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- LOGIN LOGIC ---
const loginBtn = document.getElementById('login-btn');
if(loginBtn) {
    loginBtn.onclick = async () => {
        const result = await signInWithPopup(auth, provider);
        window.location.href = `editor.html`;
    };
}

// --- SAVE DATA (Editor) ---
const saveBtn = document.getElementById('save-btn');
if(saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if(user) {
            await setDoc(doc(db, "users", user.uid), {
                name: document.getElementById('edit-name').value,
                bio: document.getElementById('edit-bio').value,
                avatar: user.photoURL,
                uid: user.uid
            });
            alert("Profile Saved!");
            document.getElementById('share-url').innerText = `Your Link: ${window.location.origin}/?u=${user.uid}`;
        }
    };
}

// --- LOAD PROFILE (Profile View) ---
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('u');
if(userId) {
    document.getElementById('landing').classList.add('hidden');
    document.getElementById('profile').classList.remove('hidden');
    
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('p-name').innerText = data.name;
        document.getElementById('p-bio').innerText = data.bio;
        document.getElementById('p-img').src = data.avatar;
    }
}
