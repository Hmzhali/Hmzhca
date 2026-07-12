const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

content = content.replace(
  "import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';",
  "import { initializeFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';"
);

content = content.replace(
  "export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);",
  `export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);`
);

fs.writeFileSync('src/lib/firebase.ts', content);
console.log("Patched firebase.ts");
