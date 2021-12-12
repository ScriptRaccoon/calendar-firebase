import { initializeFirebase } from "./firebase.js";

initializeFirebase();

$(".authForm").fadeIn();

firebase.auth().onAuthStateChanged((user) => {
    if (user && user.emailVerified) {
        window.location.href = `./calendar.html`;
    }
});

$("#loginForm").on("submit", (e) => {
    e.preventDefault();
    const email = $("#emailInput").val();
    const password = $("#passwordInput").val();
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user.emailVerified) {
                window.location.href = `./calendar.html`;
            } else {
                $(".authError").text(
                    "You need to verify your e-mail address first. Please check your inbox."
                );
                user.sendEmailVerification();
            }
        })
        .catch((error) => {
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
        .then(() => {
            $(".success").text(
                "Registration was successful! You will be redirected to the login page."
            );
            setTimeout(() => {
                window.location.href = `./login.html`;
            }, 3000);
        })
        .catch((error) => {
            $(".authError").text(error.message);
        });
});
