const API_BASE_URL = "http://localhost:8080";

const token =
    sessionStorage.getItem("campusfix_token");

if (!token) {
    window.location.href = "login.html";
}

let currentUser = null;


/* =========================================================
   ELEMENTS
   ========================================================= */

const welcomeName =
    document.getElementById("welcomeName");

const sidebarUserName =
    document.getElementById("sidebarUserName");

const dashboardAvatar =
    document.getElementById("dashboardAvatar");

const sidebarAvatar =
    document.getElementById("sidebarAvatar");

const totalRequests =
    document.getElementById("totalRequests");

const pendingRequests =
    document.getElementById("pendingRequests");

const inProgressRequests =
    document.getElementById("inProgressRequests");

const resolvedRequests =
    document.getElementById("resolvedRequests");

const requestForm =
    document.getElementById("requestForm");

const requestTitle =
    document.getElementById("requestTitle");

const requestDescription =
    document.getElementById("requestDescription");

const requestLocation =
    document.getElementById("requestLocation");

const requestCategory =
    document.getElementById("requestCategory");

const issuePhoto =
    document.getElementById("issuePhoto");

const requestMessage =
    document.getElementById("requestMessage");

const requestButton =
    document.getElementById("requestButton");

const requestButtonText =
    document.getElementById("requestButtonText");

const requestSpinner =
    document.getElementById("requestSpinner");

const refreshRequests =
    document.getElementById("refreshRequests");

const requestsList =
    document.getElementById("requestsList");

const logoutButton =
    document.getElementById("logoutButton");


/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadStudentDashboard();
    }
);


/* =========================================================
   LOAD STUDENT DASHBOARD
   ========================================================= */

async function loadStudentDashboard() {

    try {

        const users =
            await apiRequest("/users");

        const jwtPayload =
            decodeJwtPayload(token);

        /* Find logged-in student using JWT email */

        if (jwtPayload?.sub) {

            currentUser =
                users.find(
                    user =>
                        user.email ===
                        jwtPayload.sub
                );
        }

        /* Fallback */

        if (!currentUser) {

            const role =
                sessionStorage.getItem(
                    "campusfix_role"
                );

            currentUser =
                users.find(
                    user =>
                        String(
                            user.role
                        ).toUpperCase() ===
                        String(
                            role
                        ).toUpperCase()
                );
        }

        if (!currentUser) {

            showMessage(
                "Unable to identify your student account.",
                "error"
            );

            return;
        }

        setStudentDetails(
            currentUser
        );

        await loadRequests();

    } catch (error) {

        console.error(error);

        if (
            error.message ===
            "Unauthorized"
        ) {

            logout();

            return;
        }

        requestsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    Unable to load requests
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>
        `;
    }
}


/* =========================================================
   STUDENT DETAILS
   ========================================================= */

function setStudentDetails(student) {

    const name =
        student.name || "Student";

    welcomeName.textContent =
        name;

    sidebarUserName.textContent =
        name;

    const initial =
        name
            .trim()
            .charAt(0)
            .toUpperCase();

    dashboardAvatar.textContent =
        initial;

    sidebarAvatar.textContent =
        initial;
}


/* =========================================================
   LOAD REQUESTS
   ========================================================= */

async function loadRequests() {

    const requests =
        await apiRequest(
            "/requests"
        );

    const myRequests =
        requests.filter(
            request =>
                Number(
                    request.studentId
                ) ===
                Number(
                    currentUser.id
                )
        );

    updateStatistics(
        myRequests
    );

    renderRequests(
        myRequests
    );
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics(
    requests
) {

    const total =
        requests.length;

    const pending =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) === "PENDING"
        ).length;

    const inProgress =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) === "IN_PROGRESS"
        ).length;

    const resolved =
        requests.filter(
            request =>
                normalizeStatus(
                    request.status
                ) === "RESOLVED"
        ).length;

    totalRequests.textContent =
        total;

    pendingRequests.textContent =
        pending;

    inProgressRequests.textContent =
        inProgress;

    resolvedRequests.textContent =
        resolved;
}


/* =========================================================
   RENDER MY REQUESTS
   ========================================================= */

function renderRequests(
    requests
) {

    if (!requests.length) {

        requestsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ◷
                </div>

                <h3>
                    No requests yet
                </h3>

                <p>
                    Your maintenance requests
                    will appear here.
                </p>

            </div>
        `;

        return;
    }

    requests.sort(
        (a, b) =>
            Number(b.id) -
            Number(a.id)
    );

    requestsList.innerHTML =
        requests
            .map(
                request =>
                    createRequestCard(
                        request
                    )
            )
            .join("");
}


/* =========================================================
   REQUEST CARD
   ========================================================= */

function createRequestCard(
    request
) {

    const status =
        normalizeStatus(
            request.status
        );

    let statusClass =
        "status-default";

    if (status === "PENDING") {

        statusClass =
            "status-pending";
    }

    if (status === "IN_PROGRESS") {

        statusClass =
            "status-progress";
    }

    if (status === "RESOLVED") {

        statusClass =
            "status-resolved";
    }

    const displayStatus =
        status === "IN_PROGRESS"
            ? "In Progress"
            : capitalize(
                status || "Unknown"
            );

    const issuePhotoHtml =
        request.issuePhoto
            ? `
                <div style="
                    margin-top:16px;
                    padding-top:16px;
                    border-top:1px solid rgba(255,255,255,.08);
                ">

                    <div style="
                        font-size:12px;
                        font-weight:600;
                        margin-bottom:8px;
                        opacity:.75;
                    ">
                        Issue Photo
                    </div>

                    <img
                        src="${API_BASE_URL}/uploads/${encodeURIComponent(request.issuePhoto)}"
                        alt="Issue photo"
                        style="
                            width:180px;
                            height:120px;
                            object-fit:cover;
                            border-radius:10px;
                            border:1px solid rgba(255,255,255,.1);
                            display:block;
                        "
                        onerror="this.style.display='none';"
                    >

                </div>
            `
            : "";

    const completionPhotoHtml =
        request.completionPhoto
            ? `
                <div style="
                    margin-top:16px;
                    padding-top:16px;
                    border-top:1px solid rgba(54,199,176,.15);
                ">

                    <div style="
                        font-size:12px;
                        font-weight:600;
                        color:#36c7b0;
                        margin-bottom:8px;
                    ">
                        ✓ Completion Photo
                    </div>

                    <img
                        src="${API_BASE_URL}/uploads/${encodeURIComponent(request.completionPhoto)}"
                        alt="Completion photo"
                        style="
                            width:180px;
                            height:120px;
                            object-fit:cover;
                            border-radius:10px;
                            border:1px solid rgba(54,199,176,.25);
                            display:block;
                        "
                        onerror="this.style.display='none';"
                    >

                </div>
            `
            : "";

    return `
        <article class="request-card">

            <div class="request-card-top">

                <div>

                    <div class="request-title">
                        ${escapeHtml(
                            request.title ||
                            "Untitled request"
                        )}
                    </div>

                    <div class="request-description">
                        ${escapeHtml(
                            request.description ||
                            "No description provided."
                        )}
                    </div>

                </div>

                <span
                    class="request-status ${statusClass}"
                >
                    ${displayStatus}
                </span>

            </div>


            <div class="request-details">

                <div class="request-detail">

                    <small>
                        Location
                    </small>

                    <span>
                        ${escapeHtml(
                            request.location ||
                            "Not specified"
                        )}
                    </span>

                </div>


                <div class="request-detail">

                    <small>
                        Category
                    </small>

                    <span>
                        ${escapeHtml(
                            request.category ||
                            "Other"
                        )}
                    </span>

                </div>


                <div class="request-detail">

                    <small>
                        Request ID
                    </small>

                    <span>
                        #${request.id}
                    </span>

                </div>


                <div class="request-detail">

                    <small>
                        Status
                    </small>

                    <span>
                        ${displayStatus}
                    </span>

                </div>

            </div>


            ${issuePhotoHtml}

            ${completionPhotoHtml}

        </article>
    `;
}


/* =========================================================
   SUBMIT NEW REQUEST
   ========================================================= */

requestForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!currentUser) {

            showMessage(
                "Student account not loaded.",
                "error"
            );

            return;
        }

        setSubmitting(true);

        hideMessage();

        try {

            /* -----------------------------------------
               STEP 1
               Create maintenance request
               ----------------------------------------- */

            const requestData = {

                title:
                    requestTitle.value.trim(),

                description:
                    requestDescription.value.trim(),

                location:
                    requestLocation.value.trim(),

                category:
                    requestCategory.value,

                studentId:
                    currentUser.id
            };


            const createdRequest =
                await apiRequest(
                    "/requests",
                    {
                        method: "POST",
                        body: requestData
                    }
                );


            /* -----------------------------------------
               STEP 2
               Upload issue photo if selected
               ----------------------------------------- */

            if (
                issuePhoto &&
                issuePhoto.files &&
                issuePhoto.files.length > 0
            ) {

                const photo =
                    issuePhoto.files[0];

                const formData =
                    new FormData();

                formData.append(
                    "photo",
                    photo
                );

                await apiRequest(
                    `/requests/${createdRequest.id}/issue-photo`,
                    {
                        method: "PUT",
                        body: formData
                    }
                );
            }


            /* -----------------------------------------
               SUCCESS
               ----------------------------------------- */

            showMessage(
                "Maintenance request submitted successfully.",
                "success"
            );

            requestForm.reset();

            await loadRequests();

            setTimeout(
                () => {
                    hideMessage();
                },
                4000
            );

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Failed to submit maintenance request.",
                "error"
            );

        } finally {

            setSubmitting(false);
        }
    }
);


/* =========================================================
   SUBMIT BUTTON
   ========================================================= */

function setSubmitting(
    isSubmitting
) {

    requestButton.disabled =
        isSubmitting;

    requestButtonText.textContent =
        isSubmitting
            ? "Submitting..."
            : "Submit request";

    if (isSubmitting) {

        requestSpinner.classList.remove(
            "hidden"
        );

    } else {

        requestSpinner.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   REFRESH
   ========================================================= */

refreshRequests.addEventListener(
    "click",
    async () => {

        refreshRequests.disabled =
            true;

        try {

            await loadRequests();

        } catch (error) {

            console.error(error);

        } finally {

            refreshRequests.disabled =
                false;
        }
    }
);


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = "success"
) {

    requestMessage.textContent =
        message;

    requestMessage.classList.remove(
        "hidden"
    );

    requestMessage.classList.remove(
        "success",
        "error"
    );

    requestMessage.classList.add(
        type
    );
}


function hideMessage() {

    requestMessage.classList.add(
        "hidden"
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

logoutButton.addEventListener(
    "click",
    logout
);


function logout() {

    sessionStorage.removeItem(
        "campusfix_token"
    );

    sessionStorage.removeItem(
        "campusfix_role"
    );

    window.location.href =
        "login.html";
}


/* =========================================================
   JWT
   ========================================================= */

function decodeJwtPayload(jwt) {

    try {

        const payload =
            jwt.split(".")[1];

        return JSON.parse(
            atob(
                payload
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

    } catch (error) {

        return null;
    }
}


/* =========================================================
   STATUS
   ========================================================= */

function normalizeStatus(
    status
) {

    return String(
        status || ""
    )
        .trim()
        .toUpperCase();
}


function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1).toLowerCase()
    );
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   API REQUEST
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const headers = {

        "Authorization":
            `Bearer ${token}`,

        ...(options.headers || {})
    };


    /*
       IMPORTANT:

       FormData automatically sets the correct
       multipart/form-data Content-Type.

       So we must NOT manually set Content-Type
       when uploading photos.
    */

    const isFormData =
        options.body instanceof FormData;


    if (!isFormData) {

        headers["Content-Type"] =
            "application/json";
    }


    const response =
        await fetch(
            API_BASE_URL + endpoint,
            {
                ...options,

                headers,

                body:
                    isFormData
                        ? options.body
                        : options.body !== undefined
                            ? JSON.stringify(
                                options.body
                            )
                            : undefined
            }
        );


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        throw new Error(
            "Unauthorized"
        );
    }


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    let data;


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    } else {

        data =
            await response.text();
    }


    if (!response.ok) {

        let message =
            "Request failed.";

        if (
            typeof data === "string" &&
            data.trim()
        ) {

            message =
                data;

        } else if (
            data?.message
        ) {

            message =
                data.message;

        } else if (
            data?.error
        ) {

            message =
                data.error;
        }

        throw new Error(
            message
        );
    }


    return data;
}