// 1. Import Firebase modules using the CDN links (required for GitHub Pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10/app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10/firebase-firestore.js";

// 2. Your specific Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNl7BW60B6GrHrGx02QaiUbZU3Z3oYlXM",
  authDomain: "socialize-614d2.firebaseapp.com",
  projectId: "socialize-614d2",
  storageBucket: "socialize-614d2.firebasestorage.app",
  messagingSenderId: "506436447388",
  appId: "1:506436447388:web:c8d876b69ed57048981159",
  measurementId: "G-Z5E41M8VCV"
};

// 3. Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

---

// 4. LOGIN LOGIC (For index.html)
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Logged in as:", result.user.displayName);
            // Redirect to the editor page after successful login
            window.location.href = './editor.html';
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login failed. Make sure 'pexiround.github.io' is in your Authorized Domains!");
        }
    };
}

// 5. SAVE LOGIC (For editor.html)
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in first!");
            return;
        }

        const name = document.getElementById('edit-name').value;
        const bio = document.getElementById('edit-bio').value;

        try {
            // Save data to Firestore under a folder called "users"
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                bio: bio,
                photo: user.photoURL,
                uid: user.uid,
                lastUpdated: new Date()
            });

            // Show the shareable link section
            const shareSection = document.getElementById('share-section');
            const shareUrl = document.getElementById('share-url');
            if (shareSection && shareUrl) {
                shareSection.classList.remove('hidden');
                // Create a link that points back to index.html with the user ID
                const link = `${window.location.origin}/Socialize/index.html?u=${user.uid}`;
                shareUrl.innerText = link;
            }

            alert("Profile Socialized!");
        } catch (error) {
            console.error("Save Error:", error);
            alert("Error saving profile. Check your Firestore Rules!");
        }
    };
}
