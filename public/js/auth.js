import { initializeFirebase } from "./firebase.js";

initializeFirebase();

$("#loginForm").on("submit", (e) => {
    e.preventDefault();
    console.log("try login");
    const email = $("#emailInput").val();
    const password = $("#passwordInput").val();
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // const user = userCredential.user;
            // console.log(user);
            window.location.href = "./calendar.html";
        })
        .catch((error) => {
            console.log(error);
            $(".authError").text(error.message);
        });
});

$("#registerForm").on("submit", (e) => {
    e.preventDefault();
    console.log("try register");
    const email = $("#emailInput").val();
    const password = $("#passwordInput").val();
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // const user = userCredential.user;
            // console.log(user);
            window.location.href = "./calendar.html";
        })
        .catch((error) => {
            console.log(error);
            $(".authError").text(error.message);
        });
});
