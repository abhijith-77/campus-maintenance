const API_BASE_URL = "http://localhost:8080";

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginSpinner =
    document.getElementById("loginSpinner");

const loginError =
    document.getElementById("loginError");

const togglePassword =
    document.getElementById("togglePassword");


/* =========================
   Password visibility
   ========================= */

togglePassword.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.textContent =
        isPassword ? "Hide" : "Show";

});


/* =========================
   Login
   ========================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        hideLoginError();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        /* Basic validation */

        if (!email) {

            showLoginError(
                "Please enter your email."
            );

            emailInput.focus();

            return;
        }

        if (!password) {

            showLoginError(
                "Please enter your password."
            );

            passwordInput.focus();

            return;
        }


        setLoading(true);


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Invalid email or password."
                );
            }


            /*
             * Backend currently returns
             * the JWT as a plain String.
             */

            const token =
                await response.text();


            if (!token) {

                throw new Error(
                    "Login failed. No token received."
                );
            }


            /* =========================
               Save JWT
               ========================= */

            sessionStorage.setItem(
                "campusfix_token",
                token
            );


            /*
             * Decode JWT payload to get role.
             * This does NOT verify the token.
             * Verification is still done by backend.
             */

            const payload =
                decodeJwtPayload(token);


            const role =
                payload?.role;


            if (!role) {

                throw new Error(
                    "Login succeeded, but user role was not received."
                );
            }


            /* =========================
               Save role
               ========================= */

            sessionStorage.setItem(
                "campusfix_role",
                role
            );


            /* =========================
               Redirect according to role
               ========================= */

            if (role === "ADMIN") {

                window.location.href =
                    "admin.html";

            } else if (
                role === "STAFF" ||
                role === "MAINTENANCE"
            ) {

                window.location.href =
                    "staff.html";

            } else {

                window.location.href =
                    "student.html";
            }


        } catch (error) {

            showLoginError(
                error.message ||
                "Unable to sign in."
            );

        } finally {

            setLoading(false);
        }

    }
);


/* =========================
   JWT payload
   ========================= */

function decodeJwtPayload(token) {

    try {

        const parts =
            token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const base64 =
            parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        const json =
            decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(
                        char =>
                            "%" +
                            (
                                "00" +
                                char
                                    .charCodeAt(0)
                                    .toString(16)
                            ).slice(-2)
                    )
                    .join("")
            );

        return JSON.parse(json);

    } catch (error) {

        console.error(
            "Unable to decode JWT:",
            error
        );

        return null;
    }
}


/* =========================
   UI helpers
   ========================= */

function showLoginError(message) {

    loginError.textContent =
        message;

    loginError.classList.remove(
        "hidden"
    );
}


function hideLoginError() {

    loginError.textContent =
        "";

    loginError.classList.add(
        "hidden"
    );
}


function setLoading(isLoading) {

    loginButton.disabled =
        isLoading;

    if (isLoading) {

        loginButtonText.textContent =
            "Signing in...";

        loginSpinner.classList.remove(
            "hidden"
        );

    } else {

        loginButtonText.textContent =
            "Sign in";

        loginSpinner.classList.add(
            "hidden"
        );
    }
}