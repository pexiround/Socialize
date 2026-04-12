import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- THE PULSE: GLOBAL USER COUNTER ---
async function updateGlobalCounter() {
    const querySnapshot = await getDocs(collection(db, "users"));
    const count = querySnapshot.size;
    const counterEl = document.getElementById('global-counter');
    if (counterEl) counterEl.innerText = `${count} PEOPLE SOCIALIZING`;
}
updateGlobalCounter();

// --- AUTH & EDITOR LOGIC ---
onAuthStateChanged(auth, async (user) => {
    if (user && window.location.pathname.includes('editor.html')) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('edit-name').value = data.name || "";
            document.getElementById('edit-bio').value = data.bio || "";
            document.getElementById('edit-ig').value = data.instagram || "";
            if(data.theme) document.body.className = data.theme;
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

// --- SAVE PROFILE (With Theme & Socials) ---
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;
        
        const name = document.getElementById('edit-name').value.trim();
        const theme = document.getElementById('theme-select').value;
        const ig = document.getElementById('edit-ig').value.trim();

        try {
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                bio: document.getElementById('edit-bio').value,
                instagram: ig,
                theme: theme,
                avatar: user.photoURL,
                uid: user.uid,
                isVerified: user.email === "your-email@gmail.com" // Set your email here for auto-verify
            }, { merge: true });
            alert("Profile Synced!");
            showLink(user.uid);
        } catch (e) { alert("Error!"); }
    };
}

// --- LOGIN ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        await signInWithPopup(auth, provider);
        window.location.href = './editor.html';
    };
}

// --- VIEW PROFILE (With View Counter) ---
const params = new URLSearchParams(window.location.search);
const uid = params.get('u');
if (uid && document.getElementById('profile-view')) {
    const landing = document.getElementById('landing-view');
    if (landing) landing.style.display = 'none';

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Update View Count
        await updateDoc(docRef, { views: increment(1) });

        document.body.className = data.theme || 'theme-midnight';
        document.getElementById('profile-view').classList.remove('hidden');
        document.getElementById('user-name').innerHTML = `${data.name} ${data.isVerified ? '<span class="text-fuchsia-500 text-sm">check_circle</span>' : ''}`;
        document.getElementById('user-bio').innerText = data.bio;
        document.getElementById('user-photo').src = data.avatar;
        document.getElementById('view-count').innerText = `${data.views || 0} VIEWS`;
        
        if(data.instagram) {
            const igBtn = document.getElementById('ig-link');
            igBtn.classList.remove('hidden');
            igBtn.href = `https://instagram.com/${data.instagram}`;
        }
    }
}
