import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyDkAgXcbL0gaysTWVmooaW8jPknOHqLGAM",
    authDomain: "fir-ea992.firebaseapp.com",
    projectId: "fir-ea992",
    storageBucket: "fir-ea992.appspot.com",
    messagingSenderId: "148430595596",
    appId: "1:148430595596:web:9a8ca7395bf23c8fe63029",
    measurementId: "G-C9K0G4KMH7"
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig);

  const db = firebaseApp.firestore();
  const auth = firebase.auth();

  export { db, auth };
