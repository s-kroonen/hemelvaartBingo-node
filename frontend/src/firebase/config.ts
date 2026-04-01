import {getAuth} from "firebase/auth";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCnoaVMoFku5N_cDcgFIumu3AvMWBebyys",
    authDomain: "hemelvaartbingo.firebaseapp.com",
    projectId: "hemelvaartbingo",
    storageBucket: "hemelvaartbingo.firebasestorage.app",
    messagingSenderId: "811255419240",
    appId: "1:811255419240:web:11063266902d5acd93c6dd",
    measurementId: "G-F3KJ3V7QZY"
};

let app: ReturnType<typeof initializeApp> | null = null;
// let auth: ReturnType<typeof getAuth> | null = null;

    app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth };