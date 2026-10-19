const API_BASE_URL = "http://localhost:8080";

const token = sessionStorage.getItem("campusfix_token")

if (!token) {
    window.location.href = "login.html";
}


/* =========================================================
   ELEMENTS
   ========================================================= */

const staffWelcomeName =
    document.getElementById("staffWelcomeName");

const staffSidebarName =
    document.getElementById("staffSidebarName");

const staffTopAvatar =
    document.getElementById("staffTopAvatar");

const staffSidebarAvatar =
    document.getElementById("staffSidebarAvatar");

const staffTotalRequests =
    document.getElementById("staffTotalRequests");

const staffPendingRequests =
    document.getElementById("staffPendingRequests");

const staffInProgressRequests =
    document.getElementById("staffInProgressRequests");

const staffResolvedRequests =
    document.getElementById("staffResolvedRequests");

const staffRequestsList =
    document.getElementById("staffRequestsList");

const staffPendingList =
    document.getElementById("staffPendingList");

const staffInProgressList =
    document.getElementById("staffInProgressList");

const staffRefresh =
    document.getElementById("staffRefresh");

const staffLogout =
    document.getElementById("staffLogout");


/* =========================================================
   CURRENT STAFF
   ========================================================= */

let currentStaff = null;


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadStaffDashboard();
});


async function loadStaffDashboard() {

    try {

        const users =
            await apiRequest("/users");

        const jwtPayload =
            decodeJwtPayload(token);


        currentStaff = null;


        // Find staff using logged-in email
        if (jwtPayload?.sub) {

            currentStaff = users.find(
                user =>
                    user.email === jwtPayload.sub &&
                    String(user.role).toUpperCase() === "STAFF"
            );
        }


        // Fallback: find any STAFF user
        if (!currentStaff) {

            currentStaff = users.find(
                user =>
                    String(user.role).toUpperCase() === "STAFF"
            );
        }


        if (!currentStaff) {

            alert(
                "Staff account not found."
            );

            logout();

            return;
        }


        setStaffDetails(currentStaff);

        await loadRequests();


    } catch (error) {

        console.error(error);


        if (error.message === "Unauthorized") {
            logout();
            return;
        }


        staffRequestsList.innerHTML = `
            <div class="staff-empty">
                Unable to load maintenance requests.
            </div>
        `;
    }
}


/* =========================================================
   STAFF DETAILS
   ========================================================= */

function setStaffDetails(staff) {

    const name =
        staff.name || "Staff";


    staffWelcomeName.textContent =
        name;

    staffSidebarName.textContent =
        name;


    const initial =
        name.trim()
            .charAt(0)
            .toUpperCase();


    staffTopAvatar.textContent =
        initial;

    staffSidebarAvatar.textContent =
        initial;
}


/* =========================================================
   LOAD ASSIGNED REQUESTS
   ========================================================= */

async function loadRequests() {

    const requests =
        await apiRequest("/requests");


    // IMPORTANT:
    // Staff can see ONLY requests assigned to them.
    const assignedRequests =
        requests.filter(
            request =>
                currentStaff &&
                Number(request.assignedStaffId) ===
                Number(currentStaff.id)
        );


    updateStatistics(assignedRequests);

    renderAllRequests(assignedRequests);

    renderPendingRequests(assignedRequests);

    renderInProgressRequests(assignedRequests);
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics(requests) {

    const total =
        requests.length;


    const pending =
        requests.filter(
            request =>
                normalizeStatus(request.status) ===
                "PENDING"
        ).length;


    const inProgress =
        requests.filter(
            request =>
                normalizeStatus(request.status) ===
                "IN_PROGRESS"
        ).length;


    const resolved =
        requests.filter(
            request =>
                normalizeStatus(request.status) ===
                "RESOLVED"
        ).length;


    staffTotalRequests.textContent =
        total;

    staffPendingRequests.textContent =
        pending;

    staffInProgressRequests.textContent =
        inProgress;

    staffResolvedRequests.textContent =
        resolved;
}


/* =========================================================
   ALL ASSIGNED REQUESTS
   ========================================================= */

function renderAllRequests(requests) {

    if (!requests.length) {

        staffRequestsList.innerHTML = `
            <div class="staff-empty">
                No requests have been assigned to you.
            </div>
        `;

        return;
    }


    requests.sort(
        (a, b) =>
            Number(b.id) -
            Number(a.id)
    );


    staffRequestsList.innerHTML =
        requests.map(
            request =>
                createRequestCard(request)
        ).join("");
}


/* =========================================================
   PENDING REQUESTS
   ========================================================= */

function renderPendingRequests(requests) {

    const pending =
        requests.filter(
            request =>
                normalizeStatus(request.status) ===
                "PENDING"
        );


    if (!pending.length) {

        staffPendingList.innerHTML = `
            <div class="staff-empty">
                No pending requests assigned to you.
            </div>
        `;

        return;
    }


    staffPendingList.innerHTML =
        pending.map(
            request =>
                createRequestCard(request)
        ).join("");
}


/* =========================================================
   IN PROGRESS REQUESTS
   ========================================================= */

function renderInProgressRequests(requests) {

    const inProgress =
        requests.filter(
            request =>
                normalizeStatus(request.status) ===
                "IN_PROGRESS"
        );


    if (!inProgress.length) {

        staffInProgressList.innerHTML = `
            <div class="staff-empty">
                No requests are currently in progress.
            </div>
        `;

        return;
    }


    staffInProgressList.innerHTML =
        inProgress.map(
            request =>
                createRequestCard(request)
        ).join("");
}


/* =========================================================
   REQUEST CARD
   ========================================================= */

function createRequestCard(request) {

    const status =
        normalizeStatus(request.status);


    let statusClass =
        "staff-status-default";


    if (status === "PENDING") {

        statusClass =
            "staff-status-pending";
    }


    if (status === "IN_PROGRESS") {

        statusClass =
            "staff-status-progress";
    }


    if (status === "RESOLVED") {

        statusClass =
            "staff-status-resolved";
    }


    const displayStatus =
        status === "IN_PROGRESS"
            ? "In Progress"
            : capitalize(
                status || "Unknown"
            );


    return `
        <article class="staff-request-card">

            <div class="staff-request-top">

                <div>

                    <div class="staff-request-title">

                        ${escapeHtml(
                            request.title ||
                            "Untitled request"
                        )}

                    </div>


                    <div class="staff-request-description">

                        ${escapeHtml(
                            request.description ||
                            "No description provided."
                        )}

                    </div>

                </div>


                <span
                    class="staff-request-status ${statusClass}"
                >
                    ${displayStatus}
                </span>

            </div>


            <div class="staff-request-details">

                <div class="staff-detail">

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


                <div class="staff-detail">

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


                <div class="staff-detail">

                    <small>
                        Student ID
                    </small>

                    <span>

                        ${request.studentId ?? "-"}

                    </span>

                </div>


                <div class="staff-detail">

                    <small>
                        Assigned Staff
                    </small>

                    <span>

                        ${currentStaff
                            ? escapeHtml(
                                currentStaff.name ||
                                "You"
                            )
                            : "You"}

                    </span>

                </div>

            </div>


            ${createActions(
                request,
                status
            )}

        </article>
    `;
}


/* =========================================================
   ACTIONS
   ========================================================= */

function createActions(
    request,
    status
) {

    /* -----------------------------------------------------
       RESOLVED
       ----------------------------------------------------- */

    if (status === "RESOLVED") {

        return `
            <div class="staff-request-actions">

                <span
                    style="
                        color:#5bd3bd;
                        font-size:10px;
                        font-weight:600;
                    "
                >
                    ✓ Request completed
                </span>

            </div>
        `;
    }


    /* -----------------------------------------------------
       IN PROGRESS
       ----------------------------------------------------- */

    if (status === "IN_PROGRESS") {

        return `
            <div class="staff-request-actions">

                <button
                    type="button"
                    class="staff-action-btn resolve"
                    onclick="openCompletionUpload(
                        ${request.id}
                    )"
                >
                    ✓ Complete Work
                </button>

            </div>

            <div
                id="completion-box-${request.id}"
                class="completion-upload-box"
                style="display:none;"
            >

                <div
                    style="
                        margin-top:14px;
                        padding:16px;
                        border:1px solid rgba(255,255,255,0.10);
                        border-radius:12px;
                        background:rgba(255,255,255,0.04);
                    "
                >

                    <label
                        for="completion-photo-${request.id}"
                        style="
                            display:block;
                            margin-bottom:10px;
                            color:#dce6f2;
                            font-size:13px;
                            font-weight:600;
                        "
                    >
                        Upload completed work photo
                    </label>


                    <input
                        type="file"
                        id="completion-photo-${request.id}"
                        accept="image/*"
                        style="
                            width:100%;
                            color:#9fb0c4;
                            font-size:12px;
                            margin-bottom:12px;
                        "
                    />


                    <button
                        type="button"
                        class="staff-action-btn resolve"
                        onclick="completeRequest(
                            ${request.id}
                        )"
                    >
                        Upload & Complete
                    </button>

                </div>

            </div>
        `;
    }


    /* -----------------------------------------------------
       PENDING
       ----------------------------------------------------- */

    return `
        <div class="staff-request-actions">

            <button
                type="button"
                class="staff-action-btn progress"
                onclick="updateRequestStatus(
                    ${request.id},
                    'IN_PROGRESS'
                )"
            >
                ↻ Start Work
            </button>

        </div>
    `;
}


/* =========================================================
   START / UPDATE STATUS
   ========================================================= */

async function updateRequestStatus(
    requestId,
    status
) {

    try {

        await apiRequest(
            `/requests/${requestId}/status?status=${status}`,
            {
                method: "PUT"
            }
        );


        await loadRequests();


    } catch (error) {

        console.error(error);


        if (error.message === "Unauthorized") {

            logout();

            return;
        }


        alert(
            error.message ||
            "Unable to update request status."
        );
    }
}


/* =========================================================
   OPEN COMPLETION UPLOAD
   ========================================================= */

function openCompletionUpload(requestId) {

    const box =
        document.getElementById(
            `completion-box-${requestId}`
        );


    if (!box) {
        return;
    }


    if (box.style.display === "none") {

        box.style.display = "block";

    } else {

        box.style.display = "none";
    }
}


/* =========================================================
   COMPLETE REQUEST + PHOTO
   ========================================================= */

async function completeRequest(requestId) {

    const photoInput =
        document.getElementById(
            `completion-photo-${requestId}`
        );


    if (!photoInput) {

        alert(
            "Photo upload field not found."
        );

        return;
    }


    const photo =
        photoInput.files[0];


    if (!photo) {

        alert(
            "Please select a completion photo."
        );

        return;
    }


    // Allow image files only
    if (!photo.type.startsWith("image/")) {

        alert(
            "Please upload an image file."
        );

        return;
    }


    const formData =
        new FormData();

    formData.append(
        "photo",
        photo
    );


    try {

        await apiRequest(
            `/requests/${requestId}/complete`,
            {
                method: "PUT",
                body: formData
            }
        );


        alert(
            "Work completed successfully."
        );


        await loadRequests();


    } catch (error) {

        console.error(error);


        if (error.message === "Unauthorized") {

            logout();

            return;
        }


        alert(
            error.message ||
            "Unable to complete request."
        );
    }
}


/* =========================================================
   REFRESH
   ========================================================= */

staffRefresh.addEventListener(
    "click",
    async () => {

        staffRefresh.disabled = true;


        try {

            await loadRequests();


        } catch (error) {

            console.error(error);

            alert(
                "Unable to refresh requests."
            );


        } finally {

            staffRefresh.disabled = false;
        }
    }
);


/* =========================================================
   LOGOUT
   ========================================================= */

staffLogout.addEventListener(
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
   API HELPER
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const isFormData =
        options.body instanceof FormData;


    const headers = {

        "Authorization":
            `Bearer ${token}`,

        ...(options.headers || {})

    };


    // Do NOT manually set Content-Type for FormData.
    // Browser automatically adds multipart/form-data boundary.
    if (!isFormData) {

        headers["Content-Type"] =
            "application/json";
    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers: headers
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


    if (!response.ok) {

        let message =
            "Request failed.";


        try {

            const data =
                await response.json();


            if (data?.message) {

                message =
                    data.message;
            }


        } catch {

            // Ignore parsing errors
        }


        throw new Error(message);
    }


    return response.json();
}


/* =========================================================
   JWT
   ========================================================= */

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
                                char.charCodeAt(0)
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


/* =========================================================
   HELPERS
   ========================================================= */

function normalizeStatus(status) {

    return String(status || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
}


function capitalize(value) {

    if (!value) {

        return "";
    }


    return (
        value.charAt(0) +
        value.slice(1).toLowerCase()
    );
}


function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}