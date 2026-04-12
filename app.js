import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- HELPER: SHOW LINK ---
function displayLink(uid) {
    const section = document.getElementById('share-section');
    const urlBox = document.getElementById('share-url');
    if (section && urlBox) {
        section.classList.remove('hidden');
        urlBox.innerText = `${window.location.origin}/Socialize/index.html?u=${uid}`;
    }
}

// --- AUTH STATE (Load existing data) ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            displayLink(user.uid);
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

// --- SAVE (With Unique Name Check) ---
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return alert("Please login first!");

        const chosenName = document.getElementById('edit-name').value.trim();
        const chosenBio = document.getElementById('edit-bio').value;

        if (chosenName.length < 2) return alert("Name too short!");

        try {
            // 1. Check if name is taken by someone else
            const nameQuery = query(collection(db, "users"), where("name", "==", chosenName));
            const querySnapshot = await getDocs(nameQuery);
            
            let isTaken = false;
            querySnapshot.forEach((doc) => {
                if (doc.id !== user.uid) isTaken = true;
            });

            if (isTaken) {
                alert("That name is already taken! Try another one.");
                return;
            }

            // 2. Save the data
            await setDoc(doc(db, "users", user.uid), {
                name: chosenName,
                bio: chosenBio,
                avatar: user.photoURL, // Uses your Google Profile Picture
                uid: user.uid
            });

            displayLink(user.uid);
            alert("Profile Socialized!");
        } catch (e) {
            console.error(e);
            alert("Error saving. Check Firestore Rules!");
        }
    };
}

// --- PROFILE VIEW ---
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
        document.getElementById('user-photo').src = data.avatar || "https://via.placeholder.com/150";
    }
}
