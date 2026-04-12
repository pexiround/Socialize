import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- TAB NAVIGATION ---
const setupTabs = () => {
    const tabs = {
        'tab-btn-profile': 'cat-profile',
        'tab-btn-spin': 'cat-spin',
        'tab-btn-settings': 'cat-settings'
    };

    Object.keys(tabs).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.onclick = () => {
                document.querySelectorAll('.editor-category').forEach(el => el.classList.add('hidden'));
                document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('tab-active'));
                document.getElementById(tabs[btnId]).classList.remove('hidden');
                btn.classList.add('tab-active');
            };
        }
    });
};

// --- THE WHEEL LOGIC ---
const setupWheel = () => {
    const spinBtn = document.getElementById('spin-trigger-btn');
    const wheel = document.getElementById('main-wheel');

    if (spinBtn) {
        spinBtn.onclick = async () => {
            const user = auth.currentUser;
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);
            const data = snap.data();

            const lastSpin = data.lastSpin || 0;
            if (Date.now() - lastSpin < 3600000) return alert("Wait for cooldown!");

            // Animation
            wheel.classList.remove('wheel-idle');
            const degrees = Math.floor(5000 + Math.random() * 5000);
            wheel.style.transform = `rotate(${degrees}deg)`;

            spinBtn.disabled = true;
            spinBtn.innerText = "SPINNING...";

            setTimeout(async () => {
                const prize = Math.random() > 0.9 ? 500 : 50;
                await updateDoc(userRef, { points: increment(prize), lastSpin: Date.now() });
                alert(`WINNER: +${prize} SP!`);
                location.reload();
            }, 4500);
        };
    }
};

// --- DATA SYNC ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            document.getElementById('user-points').innerText = `${data.points || 0} SP`;
            document.getElementById('view-link-btn').href = `index.html?u=${user.uid}`;
        }
        setupTabs();
        setupWheel();
    }
});

// Save & Auth
const loginBtn = document.getElementById('login-btn');
if (loginBtn) loginBtn.onclick = () => signInWithPopup(auth, provider).then(() => location.href = 'editor.html');

const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        await updateDoc(doc(db, "users", user.uid), { 
            name: document.getElementById('edit-name').value, 
            bio: document.getElementById('edit-bio').value 
        });
        alert("Synced!");
    };
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) logoutBtn.onclick = () => signOut(auth).then(() => location.href = 'index.html');
