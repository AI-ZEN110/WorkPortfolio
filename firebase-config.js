/* ============================================
   Firebase Firestore — saves each contact form
   submission as a document, alongside the email
   EmailJS sends you.
   ============================================
   SETUP (do this once):
   1. console.firebase.google.com -> Add Project
   2. Inside the project: click </> to register a web app
      -> copy the firebaseConfig object it gives you
      -> paste its values into firebaseConfig below
   3. Build -> Firestore Database -> Create Database (Production mode)
   4. In Firestore -> Rules, paste this so visitors can submit
      messages but can't read anyone else's:

        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /messages/{messageId} {
              allow create: if request.resource.data.keys().hasAll(['name','email','message'])
                             && request.resource.data.name is string
                             && request.resource.data.email is string
                             && request.resource.data.message is string;
              allow read, update, delete: if false;
            }
          }
        }

   That's it — messages will appear in Firestore Database -> Data
   under the "messages" collection.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Paste your project's config values here (from Firebase console -> Project settings)
const firebaseConfig = {
  apiKey: "AIzaSyA3fqwybBgNOJqYfTjGCUG7tZY_SOZBweI",
  authDomain: "workportfolio-321f6.firebaseapp.com",
  projectId: "workportfolio-321f6",
  storageBucket: "workportfolio-321f6.appspot.com",
  messagingSenderId: "150636434843",
  appId: "1:150636434843:web:2a0c57bae76157517a3d3e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Listens for the "contactFormValid" event dispatched by script.js
// once the form passes validation, and saves it to Firestore.
document.addEventListener('contactFormValid', async (event) => {
  const { name, email, message } = event.detail;

  try {
    await addDoc(collection(db, 'messages'), {
      name,
      email,
      message,
      createdAt: serverTimestamp(),
    });
    console.log('Message saved to Firestore.');
  } catch (error) {
    // Non-fatal: the email still sends via EmailJS even if this fails,
    // so we just log it rather than showing the visitor an error.
    console.error('Could not save message to Firestore:', error);
  }
});
