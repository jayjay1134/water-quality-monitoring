// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQCNVS6RiHEFh4DEYlU3ws--VVqXVp1MY",
  authDomain: "water-quality-monitoring-fdb6d.firebaseapp.com",
  databaseURL: "https://water-quality-monitoring-fdb6d-default-rtdb.firebaseio.com",
  projectId: "water-quality-monitoring-fdb6d",
  storageBucket: "water-quality-monitoring-fdb6d.firebasestorage.app",
  messagingSenderId: "134970272586",
  appId: "1:134970272586:web:ca8c758304dd53284f6fb3",
  measurementId: "G-6N65CXC1RP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
