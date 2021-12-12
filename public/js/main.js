import { Calendar } from "./Calendar.js";
import { initializeFirebase } from "./firebase.js";

initializeFirebase();

let user;

firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (!firebaseUser || (user && user != firebaseUser)) {
        window.location.href = "./index.html";
    } else {
        user = firebaseUser;
        new Calendar(user).setup();
    }
});
