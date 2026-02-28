const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyCIZzZljNymEvcLLJRv9R632PixbQauXeI",
  authDomain: "swift-care-baa78.firebaseapp.com",
  databaseURL: "https://swift-care-baa78-default-rtdb.firebaseio.com",
  projectId: "swift-care-baa78",
  storageBucket: "swift-care-baa78.appspot.com",
  messagingSenderId: "987536916476",
  appId: "1:987536916476:web:7ff136ba100b56cb713c79"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = { app, db };
