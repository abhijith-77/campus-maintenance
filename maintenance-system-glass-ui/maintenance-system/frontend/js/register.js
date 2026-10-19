const API_BASE_URL = "http://localhost:8080";

const registerForm =
    document.getElementById("registerForm");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const registerButton =
    document.getElementById("registerButton");

const registerButtonText =
    document.getElementById("registerButtonText");

const registerSpinner =
    document.getElementById("registerSpinner");

const registerMessage =
    document.getElementById("registerMessage");

const togglePassword =
    document.getElementById("togglePassword");


// =========================================================
// PASSWORD VISIBILITY
// =========================================================

togglePassword.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.textContent =
        isPassword ? "Hide" : "Show";

});


// =========================================================
// REGISTRATION
// =========================================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        hideMessage();


        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        // =================================================
        // VALIDATION
        // =================================================

        if (!name) {

            showMessage(
                "Please enter your full name."
            );

            nameInput.focus();

            return;
        }


        if (!email) {

            showMessage(
                "Please enter your email."
            );

            emailInput.focus();

            return;
        }


        if (!password) {

            showMessage(
                "Please enter a password."
            );

            passwordInput.focus();

            return;
        }


        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters."
            );

            passwordInput.focus();

            return;
        }


        setLoading(true);


        // =================================================
        // CREATE STUDENT ACCOUNT
        // =================================================

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/users`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            email: email,

                            password: password,

                            // Every public signup is STUDENT
                            role: "STUDENT"

                        })
                    }
                );


            if (!response.ok) {

                let errorMessage =
                    "Unable to create account.";

                try {

                    const errorData =
                        await response.json();

                    if (errorData.message) {

                        errorMessage =
                            errorData.message;

                    }

                } catch (error) {

                    // Ignore JSON parsing error
                }


                throw new Error(
                    errorMessage
                );
            }


            const user =
                await response.json();

            console.log(
                "Registered student:",
                user
            );


            showSuccess(
                "Account created successfully! Redirecting to login..."
            );


            registerForm.reset();


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1500);


        } catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Something went wrong. Please try again."
            );


        } finally {

            setLoading(false);

        }

    }
);


// =========================================================
// SHOW ERROR MESSAGE
// =========================================================

function showMessage(message) {

    registerMessage.textContent =
        message;

    registerMessage.classList.remove(
        "hidden"
    );

    registerMessage.classList.remove(
        "success"
    );

}


// =========================================================
// SHOW SUCCESS MESSAGE
// =========================================================

function showSuccess(message) {

    registerMessage.textContent =
        message;

    registerMessage.classList.remove(
        "hidden"
    );

    registerMessage.classList.add(
        "success"
    );

}


// =========================================================
// HIDE MESSAGE
// =========================================================

function hideMessage() {

    registerMessage.textContent =
        "";

    registerMessage.classList.add(
        "hidden"
    );

    registerMessage.classList.remove(
        "success"
    );

}


// =========================================================
// LOADING STATE
// =========================================================

function setLoading(isLoading) {

    registerButton.disabled =
        isLoading;


    if (isLoading) {

        registerButtonText.textContent =
            "Creating account...";

        registerSpinner.classList.remove(
            "hidden"
        );

    } else {

        registerButtonText.textContent =
            "Create account";

        registerSpinner.classList.add(
            "hidden"
        );

    }

}