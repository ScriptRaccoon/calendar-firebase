// import { Calendar } from "./Calendar.js";

import { initializeFirebase } from "./firebase.js";

// $(() => {
//     new Calendar().setup();
// });

initializeFirebase();

let user;

firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (!firebaseUser) {
        window.location.href = "./index.html";
    } else {
        user = firebaseUser;
        console.log(user);
    }
});
