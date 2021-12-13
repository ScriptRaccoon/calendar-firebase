import { initializeFirebase } from "./firebase.js";

$(() => {
    initializeFirebase();
    firebase.auth().onAuthStateChanged(checkUser);
    $(".changeBtn").on("click", changeForm);
    $("#loginForm").on("submit", handleLogin);
    $("#registerForm").on("submit", handleRegister);
});

function checkUser(user) {
    if (user && user.emailVerified) {
        window.location.href = `./calendar.html`;
    }
}

function changeForm() {
    $("#loginForm").fadeToggle("slow");
    $("#registerForm").fadeToggle("slow");
}

function handleLogin(e) {
    e.preventDefault();
    const email = $("#loginEmailInput").val();
    const password = $("#loginPasswordInput").val();
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user && user.emailVerified) {
                window.location.href = `./calendar.html`;
            } else {
                $("#loginForm .authError").text(
                    "You need to verify your e-mail address first. Please check your inbox."
                );
                user.sendEmailVerification();
            }
        })
        .catch((error) => {
            $("#loginForm .authError").text(error.message);
        });
}

function handleRegister(e) {
    e.preventDefault();
    const email = $("#registerEmailInput").val();
    const password = $("#registerPasswordInput").val();
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            user.sendEmailVerification();
            $("#registerForm .success").text(
                "Registration was successful! Please check your inbox to verify your e-mail address. Then you can login."
            );
        })
        .catch((error) => {
            $("#registerForm .authError").text(error.message);
        });
}
