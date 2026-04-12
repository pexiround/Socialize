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

// --- 💎 ECONOMY & QUESTS ---
async function syncUserStats(user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const now = Date.now();

    if (snap.exists()) {
        const data = snap.data();
        // Daily Streak Logic
        const lastLogin = data.lastLogin || 0;
        if (now - lastLogin > 86400000) {
            const newStreak = (now - lastLogin < 172800000) ? (data.streak || 0) + 1 : 1;
            await updateDoc(userRef, { 
                points: increment(50 * newStreak), 
                streak: newStreak, 
                lastLogin: now 
            });
        }
    } else {
        // Initial setup for new users
        await setDoc(userRef, {
            uid: user.uid, name: user.displayName, avatar: user.photoURL,
            points: 100, level: 1, streak: 1, lastLogin: now, views: 0,
            isOwner: false, isDeveloper: false, isVerified: false
        });
    }
}

// --- 🎡 THE HOURLY SPIN ---
window.spinWheel = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Login to spin!");
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    const lastSpin = data.lastSpin || 0;
    const cooldown = 3600000; // 1 hour
    if (Date.now() - lastSpin < cooldown) {
        const remaining = Math.ceil((cooldown - (Date.now() - lastSpin)) / 60000);
        return alert(`Cooldown active! Try again in ${remaining} mins.`);
    }

    const rand = Math.random() * 100;
    let prize = 10;
    if (rand > 95) prize = 250; // Exotic
    else if (rand > 80) prize = 50; // Rare

    await updateDoc(userRef, { points: increment(prize), lastSpin: Date.now() });
    alert(`🎰 You won ${prize} SP!`);
    location.reload();
};

// --- 🏠 LIVE COUNTER & PULSE ---
async function loadLiveStats() {
    const counterEl = document.getElementById('global-counter');
    if (counterEl) {
        const snap = await getDocs(collection(db, "users"));
        counterEl.innerHTML = `
            <span class="relative flex h-2 w-2 mr-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            ${snap.size} USERS ONLINE`;
    }
}
loadLiveStats();

// --- 🛠️ EDITOR HANDSHAKE (Fixes your "Data not showing" issue) ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        await syncUserStats(user);
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();
        
        document.getElementById('edit-name').value = data.name || "";
        document.getElementById('edit-bio').value = data.bio || "";
        document.getElementById('user-points').innerText = `${data.points || 0} SP`;
        document.getElementById('user-level').innerText = `LVL ${Math.floor((data.views || 0) / 10) + 1}`;
    }
});

// --- 👤 PROFILE RENDERING ---
const params = new URLSearchParams(window.location.search);
const profileId = params.get('u');
if (profileId && document.getElementById('profile-view')) {
    const userRef = doc(db, "users", profileId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        await updateDoc(userRef, { views: increment(1) });

        document.getElementById('landing-view').classList.add('hidden');
        document.getElementById('profile-view').classList.remove('hidden');
        
        // Steam-style badge rendering
        let badgeHtml = '';
        if(data.isOwner) badgeHtml += '<span class="bg-fuchsia-600 text-[10px] px-2 py-0.5 rounded ml-2 shadow-lg animate-pulse">OWNER</span>';
        if(data.isDeveloper) badgeHtml += '<span class="bg-blue-600 text-[10px] px-2 py-0.5 rounded ml-2">DEV</span>';
        
        document.getElementById('user-name').innerHTML = data.name + badgeHtml;
        document.getElementById('user-bio').innerText = data.bio;
        document.getElementById('user-photo').src = data.avatar;
        document.getElementById('lvl-display').innerText = `Level ${Math.floor((data.views || 0) / 10) + 1}`;
    }
}

// Auth Login
const loginBtn = document.getElementById('login-btn');
if (loginBtn) loginBtn.onclick = () => signInWithPopup(auth, provider).then(() => window.location.href = './editor.html');

// Save Profile
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        const name = document.getElementById('edit-name').value;
        const bio = document.getElementById('edit-bio').value;
        await updateDoc(doc(db, "users", user.uid), { name, bio });
        alert("Profile Updated!");
    };
}
