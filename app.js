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

const path = window.location.pathname;

// ==========================================
// 🏠 LANDING PAGE LOGIC (index.html)
// ==========================================
if (path.includes('index.html') || path.endsWith('/')) {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.onclick = () => signInWithPopup(auth, provider).then(() => location.href = 'editor.html');
    }

    const counter = document.getElementById('global-counter');
    if (counter) {
        getDocs(collection(db, "users")).then(snap => {
            counter.innerHTML = `<span class="relative flex h-2 w-2 mr-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> ${snap.size} USERS ONLINE`;
        });
    }
}

// ==========================================
// 🛠️ EDITOR LOGIC (editor.html)
// ==========================================
if (path.includes('editor.html')) {
    // 1. Load User Data
    onAuthStateChanged(auth, async (user) => {
        if (!user) return location.href = 'index.html';

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            document.getElementById('user-points').innerText = `${data.points || 0} SP`;
            
            // FIX: Your Link now points to profile.html
            document.getElementById('view-link-btn').href = `profile.html?u=${user.uid}`;
        } else {
            await setDoc(userRef, { uid: user.uid, name: user.displayName, avatar: user.photoURL, points: 100, views: 0 });
            location.reload();
        }
    });

    // 2. Tab Switcher
    const tabs = { 'tab-profile': 'cat-profile', 'tab-spin': 'cat-spin', 'tab-settings': 'cat-settings' };
    Object.keys(tabs).forEach(btnId => {
        document.getElementById(btnId).onclick = (e) => {
            document.querySelectorAll('.editor-category').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('tab-active', 'text-fuchsia-500'));
            
            document.getElementById(tabs[btnId]).classList.remove('hidden');
            e.currentTarget.classList.add('tab-active', 'text-fuchsia-500');
        };
    });

    // 3. Save Button
    document.getElementById('save-btn').onclick = async () => {
        const user = auth.currentUser;
        await updateDoc(doc(db, "users", user.uid), { 
            name: document.getElementById('edit-name').value, 
            bio: document.getElementById('edit-bio').value 
        });
        alert("Profile Synced! ✅");
    };

    // 4. Logout
    document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => location.href = 'index.html');

    // 5. Spin The Wheel
    const spinBtn = document.getElementById('spin-trigger-btn');
    const wheel = document.getElementById('main-wheel');
    spinBtn.onclick = async () => {
        const user = auth.currentUser;
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const lastSpin = snap.data().lastSpin || 0;

        if (Date.now() - lastSpin < 3600000) return alert("Cooldown: Wait 1 hour!");

        // Spin Visuals
        wheel.classList.remove('wheel-idle');
        const randomDeg = Math.floor(3600 + Math.random() * 3600); // Spins fast
        wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        wheel.style.transform = `rotate(${randomDeg}deg)`;
        spinBtn.innerText = "SPINNING...";
        spinBtn.disabled = true;

        setTimeout(async () => {
            const prize = Math.random() > 0.9 ? 500 : 50;
            await updateDoc(userRef, { points: increment(prize), lastSpin: Date.now() });
            alert(`🎰 You won ${prize} SP!`);
            location.reload();
        }, 4500);
    };
}

// ==========================================
// 👤 PUBLIC PROFILE LOGIC (profile.html)
// ==========================================
if (path.includes('profile.html')) {
    const params = new URLSearchParams(window.location.search);
    const profileId = params.get('u');
    
    if (profileId) {
        const userRef = doc(db, "users", profileId);
        getDoc(userRef).then(async (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                await updateDoc(userRef, { views: increment(1) });
                
                let badges = '';
                if(data.isOwner) badges += '<span class="bg-fuchsia-600 text-[10px] px-2 py-0.5 rounded ml-2 shadow-[0_0_10px_#d946ef]">OWNER</span>';
                if(data.isDeveloper) badges += '<span class="bg-blue-600 text-[10px] px-2 py-0.5 rounded ml-2">DEV</span>';
                
                document.getElementById('user-name').innerHTML = data.name + badges;
                document.getElementById('user-bio').innerText = data.bio;
                document.getElementById('user-photo').src = data.avatar;
                document.getElementById('lvl-display').innerText = `LEVEL ${Math.floor((data.views || 0) / 10) + 1}`;
            } else {
                document.body.innerHTML = "<h1 class='text-white text-center mt-20'>Profile Not Found</h1>";
            }
        });
    }
}
