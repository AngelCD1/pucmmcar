import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase con llaves directas para que funcione en Vercel/Internet
const firebaseConfig = {
    apiKey: "AIzaSyDNX-GQEhUuM9-kPtOqe02ud2x-3HFA8-U",
    authDomain: "pucmm-50e5c.firebaseapp.com",
    projectId: "pucmm-50e5c",
    storageBucket: "pucmm-50e5c.appspot.com",
    messagingSenderId: "165753247439",
    appId: "1:165753247439:web:58a44bc6e22a22e09209ba",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
