import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBLqPdMlwWmvLn5PtHa7BErR_wxVTIGP1Q",
  authDomain: "facebook-clone-a4d9f.firebaseapp.com",
  projectId: "facebook-clone-a4d9f",
  storageBucket: "facebook-clone-a4d9f.appspot.com",
  messagingSenderId: "1028009995319",
  appId: "1:1028009995319:web:5bf86c9ed23e822b5a63b2",
  measurementId: "G-8JZ2J7PRLF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
