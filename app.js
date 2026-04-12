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

// --- LIVE USER COUNTER ---
async function loadUserCount() {
    const counterEl = document.getElementById('global-counter');
    if (counterEl) {
        const snapshot = await getDocs(collection(db, "users"));
        counterEl.innerHTML = `<span class="relative flex h-2 w-2 mr-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> ${snapshot.size} PEOPLE SOCIALIZING`;
    }
}
loadUserCount();

// --- SAVE LOGIC ---
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return alert("Login first!");
        const name = document.getElementById('edit-name').value.trim();
        const bio = document.getElementById('edit-bio').value;
        const theme = document.getElementById('theme-select').value;

        try {
            // Check if name is taken
            const q = query(collection(db, "users"), where("name", "==", name));
            const snap = await getDocs(q);
            let taken = false;
            snap.forEach(d => { if(d.id !== user.uid) taken = true; });
            if(taken) return alert("Name taken!");

            // Default flags are false. You manually change them to true in Firebase Console!
            await setDoc(doc(db, "users", user.uid), {
                name, bio, theme,
                avatar: user.photoURL,
                uid: user.uid,
                isVerified: false, 
                isDeveloper: false,
                isOwner: false
            }, { merge: true });

            alert("Synced!");
            location.reload(); 
        } catch (e) { console.error(e); }
    };
}

// --- PROFILE VIEW (Centered & Badged) ---
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
        
        // Render Name + Badges
        let badges = '';
        if(data.isOwner) badges += '<span class="text-[10px] bg-fuchsia-600 text-white px-2 py-0.5 rounded-full ml-2">OWNER</span>';
        if(data.isDeveloper) badges += '<span class="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full ml-2">DEV</span>';
        if(data.isVerified) badges += '<span class="material-icons text-blue-400 text-sm ml-1">verified</span>';
        
        document.getElementById('user-name').innerHTML = data.name + badges;
        document.getElementById('user-bio').innerText = data.bio;
        document.getElementById('user-photo').src = data.avatar;
    }
}

// Login
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        await signInWithPopup(auth, provider);
        window.location.href = './editor.html';
    };
}
