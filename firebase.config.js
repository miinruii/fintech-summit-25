import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3Rk2IE6qjanFuzjnVTYXMCmyJXcdJyRg",
  authDomain: "swiftbid-2f87d.firebaseapp.com",
  projectId: "swiftbid-2f87d",
  storageBucket: "swiftbid-2f87d.firebasestorage.app",
  messagingSenderId: "710585896134",
  appId: "1:710585896134:web:20a5ba09a3fce6d2d09bc7",
  measurementId: "G-E0JN91QE3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const database = getDatabase(app);

export { database };
export{ auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);