const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');
content = content.replace(
  "import { initializeFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';",
  "import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';"
);
content = content.replace(
  /export const db = initializeFirestore\(app, \{[\s\S]*?\}, firebaseConfig\.firestoreDatabaseId\);/,
  "export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);"
);
fs.writeFileSync('src/lib/firebase.ts', content);
