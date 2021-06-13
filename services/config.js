import firebase from "firebase"

var firebaseConfig = {
    apiKey: "AIzaSyAR-610He9yA8MDj9oqEG7eVHM0UYAxiW4",
    authDomain: "personal-blog-5a04d.firebaseapp.com",
    projectId: "personal-blog-5a04d",
    storageBucket: "personal-blog-5a04d.appspot.com",
    messagingSenderId: "305999241594",
    appId: "1:305999241594:web:0853be6ac05f2a396cb6c3",
    measurementId: "G-KWNYQ78DYJ"
};


// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const pAuth = firebase.auth();
const pDatabase = firebase.firestore();

export {pAuth,pDatabase};