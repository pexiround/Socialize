import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- CATEGORY SWITCHER ---
window.showCategory = (catId) => {
    document.querySelectorAll('.editor-category').forEach(el => el.classList.add('hidden'));
    document.getElementById(catId).classList.remove('hidden');
    // Update button styles
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('text-fuchsia-500', 'border-fuchsia-500'));
};

// --- DATA HANDSHAKE ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            document.getElementById('user-points').innerText = `${data.points || 0} SP`;
            
            // Set the Link Button
            const linkBtn = document.getElementById('view-link-btn');
            if (linkBtn) linkBtn.href = `index.html?u=${user.uid}`;
        }
    }
});

// --- HOURLY SPIN ---
window.spinWheel = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const lastSpin = snap.data().lastSpin || 0;

    if (Date.now() - lastSpin < 3600000) return alert("Wait for the next hour!");

    const prize = Math.random() > 0.9 ? 100 : 20;
    await updateDoc(userRef, { points: increment(prize), lastSpin: Date.now() });
    alert(`Won ${prize} SP!`);
    location.reload();
};

// Login Logic
const loginBtn = document.getElementById('login-btn');
if (loginBtn) loginBtn.onclick = () => signInWithPopup(auth, provider).then(() => window.location.href = './editor.html');
