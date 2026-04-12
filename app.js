import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

// --- ATTACH TO WINDOW (Crucial for Tabs/Buttons to work) ---
window.showCategory = (catId) => {
    // Hide all
    document.querySelectorAll('.editor-category').forEach(el => el.classList.add('hidden'));
    // Show selected
    document.getElementById(catId).classList.remove('hidden');
    console.log("Switching to:", catId);
};

window.logout = () => {
    signOut(auth).then(() => { window.location.href = 'index.html'; });
};

window.spinWheel = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in first!");
    
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();
    
    const lastSpin = data.lastSpin || 0;
    const cooldown = 3600000; 
    if (Date.now() - lastSpin < cooldown) {
        const mins = Math.ceil((cooldown - (Date.now() - lastSpin)) / 60000);
        return alert(`Cooldown! Wait ${mins} more minutes.`);
    }

    const prize = Math.random() > 0.9 ? 250 : 25;
    await updateDoc(userRef, { points: increment(prize), lastSpin: Date.now() });
    alert(`🎰 Winner! You got ${prize} SP!`);
    location.reload();
};

// --- DATA SYNC ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            document.getElementById('user-points').innerText = `${data.points || 0} SP`;
            
            // Fix "Your Link" Button
            const linkBtn = document.getElementById('view-link-btn');
            if (linkBtn) {
                linkBtn.href = `index.html?u=${user.uid}`;
                linkBtn.onclick = () => console.log("Opening profile...");
            }
        }
    }
});

// Login
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = () => {
        signInWithPopup(auth, provider).then(() => {
            window.location.href = 'editor.html';
        });
    };
}

// Save Profile
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const name = document.getElementById('edit-name').value;
        const bio = document.getElementById('edit-bio').value;
        await updateDoc(doc(db, "users", user.uid), { name, bio });
        alert("Cloud Synced! ✅");
    };
}
