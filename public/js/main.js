import { Calendar } from "./Calendar.js";
import { initializeFirebase } from "./firebase.js";

initializeFirebase();

firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "./index.html";
    } else {
        new Calendar(user).setup();
    }
});
