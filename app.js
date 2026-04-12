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

// --- WINDOW FUNCTIONS (Bridging HTML and JS) ---
window.showCategory = (catId, btn) => {
    document.querySelectorAll('.editor-category').forEach(el => el.classList.add('hidden'));
    document.getElementById(catId).classList.remove('hidden');
    document.querySelectorAll('.tab-link').forEach(l => l.classList.replace('text-fuchsia-500', 'text-zinc-500'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('tab-active'));
    btn.classList.add('tab-active');
};

window.logout = () => signOut(auth).then(() => location.href = 'index.html');

window.spinWheel = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();
    
    const lastSpin = data.lastSpin || 0;
    if (Date.now() - lastSpin < 3600000) return alert("Cooldown: 1 Hour!");

    const prize = Math.random() > 0.95 ? 500 : 25;
    await updateDoc(userRef, { points: increment(prize), lastSpin: Date.now() });
    alert(`🎰 Winner! +${prize} SP`);
    location.reload();
};

// --- CORE AUTH LOGIC ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            document.getElementById('user-points').innerText = `${data.points || 0} SP`;
            document.getElementById('view-link-btn').href = `index.html?u=${user.uid}`;
        }
    }
});

// --- PROFILE VIEWER ---
const params = new URLSearchParams(window.location.search);
const profileId = params.get('u');
if (profileId && document.getElementById('profile-view')) {
    const userRef = doc(db, "users", profileId);
    getDoc(userRef).then(async (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            await updateDoc(userRef, { views: increment(1) });
            document.getElementById('landing-view').classList.add('hidden');
            document.getElementById('profile-view').classList.remove('hidden');
            
            // Badges
            let badges = '';
            if(data.isOwner) badges += '<span class="bg-fuchsia-600 text-[10px] px-2 py-0.5 rounded ml-2">OWNER</span>';
            if(data.isDeveloper) badges += '<span class="bg-blue-600 text-[10px] px-2 py-0.5 rounded ml-2">DEV</span>';
            
            document.getElementById('user-name').innerHTML = data.name + badges;
            document.getElementById('user-bio').innerText = data.bio;
            document.getElementById('user-photo').src = data.avatar;
            document.getElementById('lvl-display').innerText = `LEVEL ${Math.floor((data.views || 0) / 10) + 1}`;
        }
    });
}

// Global User Count
const counter = document.getElementById('global-counter');
if (counter) {
    getDocs(collection(db, "users")).then(snap => {
        counter.innerHTML = `<span class="relative flex h-2 w-2 mr-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> ${snap.size} USERS ONLINE`;
    });
}

// Buttons
const loginBtn = document.getElementById('login-btn');
if (loginBtn) loginBtn.onclick = () => signInWithPopup(auth, provider).then(() => location.href = 'editor.html');

const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        const name = document.getElementById('edit-name').value;
        const bio = document.getElementById('edit-bio').value;
        await updateDoc(doc(db, "users", user.uid), { name, bio });
        alert("Synced to Cloud ✅");
    };
}
