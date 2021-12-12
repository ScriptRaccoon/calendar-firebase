import { initializeFirebase, db } from "./firebase.js";

initializeFirebase();

$("#loginForm").on("submit", (e) => {
    e.preventDefault();
    const email = $("#emailInput").val();
    const password = $("#passwordInput").val();
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            window.location.href = `./calendar.html`;
        })
        .catch((error) => {
            console.log(error);
            $(".authError").text(error.message);
        });
});

$("#registerForm").on("submit", (e) => {
    e.preventDefault();
    const email = $("#emailInput").val();
    const password = $("#passwordInput").val();
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // const user = userCredential.user;
            // const userId = user.uid;
            // db.collection(userId)
            //     .doc("initial")
            //     .set({ created: true })
            //     .then(() => {
            //         window.location.href = `./calendar.html`;
            //     });
            window.location.href = `./calendar.html`;
        })
        .catch((error) => {
            console.log(error);
            $(".authError").text(error.message);
        });
});
