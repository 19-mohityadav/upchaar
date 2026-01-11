// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "sanjiwani-health",
  "appId": "1:430675200426:web:464ec1164d95ae8f9443d3",
  "storageBucket": "sanjiwani-health.firebasestorage.app",
  "apiKey": "AIzaSyCa6qJDKWj484m4DXolGuyJY7tyhoeilIk",
  "authDomain": "sanjiwani-health.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "430675200426"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
