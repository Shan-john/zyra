import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCIZzZljNymEvcLLJRv9R632PixbQauXeI",
  authDomain: "swift-care-baa78.firebaseapp.com",
  databaseURL: "https://swift-care-baa78-default-rtdb.firebaseio.com",
  projectId: "swift-care-baa78",
  storageBucket: "swift-care-baa78.appspot.com",
  messagingSenderId: "987536916476",
  appId: "1:987536916476:web:7ff136ba100b56cb713c79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
