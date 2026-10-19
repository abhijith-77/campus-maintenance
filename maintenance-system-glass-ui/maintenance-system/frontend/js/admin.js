const API_BASE_URL = "http://localhost:8080";

const token = sessionStorage.getItem("campusfix_token");

if (!token) {
    window.location.href = "login.html";
}


/* =========================================================
   ELEMENTS
   ========================================================= */

const adminWelcomeName =
    document.getElementById("adminWelcomeName");

const adminSidebarName =
    document.getElementById("adminSidebarName");

const adminTopAvatar =
    document.getElementById("adminTopAvatar");

const adminSidebarAvatar =
    document.getElementById("adminSidebarAvatar");

const adminTotalUsers =
    document.getElementById("adminTotalUsers");

const adminTotalStaff =
    document.getElementById("adminTotalStaff");

const adminTotalRequests =
    document.getElementById("adminTotalRequests");

const adminResolvedRequests =
    document.getElementById("adminResolvedRequests");

const adminPendingRequests =
    document.getElementById("adminPendingRequests");

const adminInProgressRequests =
    document.getElementById("adminInProgressRequests");

const adminResolvedStatus =
    document.getElementById("adminResolvedStatus");

const adminUsersList =
    document.getElementById("adminUsersList");

const adminRequestsList =
    document.getElementById("adminRequestsList");

const adminRefresh =
    document.getElementById("adminRefresh");

const adminLogout =
    document.getElementById("adminLogout");

const addStaffButton =
    document.getElementById("addStaffButton");


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadAdminDashboard();
    }
);


async function loadAdminDashboard() {

    try {

        const users =
            await apiRequest("/users");

        const requests =
            await apiRequest("/requests");

        // Store users for staff assignment
        window.adminUsers = users;

        setAdminDetails(users);

        updateStatistics(
            users,
            requests
        );

        renderUsers(users);

        renderRequests(requests);

    } catch (error) {

        console.error(error);

        if (error.message === "Unauthorized") {
            logout();
            return;
        }

        if (adminUsersList) {
            adminUsersList.innerHTML = `
                <div class="admin-empty">
                    Unable to load users.
                </div>
            `;
        }

        if (adminRequestsList) {
            adminRequestsList.innerHTML = `
                <div class="admin-empty">
                    Unable to load maintenance requests.
                </div>
            `;
        }
    }
}


/* =========================================================
   ADMIN DETAILS
   ========================================================= */

function setAdminDetails(users) {

    const jwtPayload =
        decodeJwtPayload(token);

    let admin = null;

    // Find admin using logged-in email
    if (jwtPayload?.sub) {

        admin = users.find(
            user =>
                user.email === jwtPayload.sub
        );
    }

    // Fallback: find any ADMIN user
    if (!admin) {

        admin = users.find(
            user =>
                String(user.role || "")
                    .toUpperCase() === "ADMIN"
        );
    }

    // No admin found
    if (!admin) {
        return;
    }

    const name =
        admin.name || "Admin";

    // Update welcome name
    if (adminWelcomeName) {
        adminWelcomeName.textContent =
            name;
    }

    // Update sidebar name
    if (adminSidebarName) {
        adminSidebarName.textContent =
            name;
    }

    const initial =
        name.trim()
            .charAt(0)
            .toUpperCase();

    // Update top avatar
    if (adminTopAvatar) {
        adminTopAvatar.textContent =
            initial;
    }

    // Update sidebar avatar
    if (adminSidebarAvatar) {
        adminSidebarAvatar.textContent =
            initial;
    }
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics(
    users,
    requests
) {

    const totalUsers =
        users.length;

    const totalStaff =
        users.filter(
            user =>
                String(user.role || "")
                    .toUpperCase() ===
                "STAFF"
        ).length;

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

    if (adminTotalUsers) {
        adminTotalUsers.textContent =
            totalUsers;
    }

    if (adminTotalStaff) {
        adminTotalStaff.textContent =
            totalStaff;
    }

    if (adminTotalRequests) {
        adminTotalRequests.textContent =
            requests.length;
    }

    if (adminResolvedRequests) {
        adminResolvedRequests.textContent =
            resolved;
    }

    if (adminPendingRequests) {
        adminPendingRequests.textContent =
            pending;
    }

    if (adminInProgressRequests) {
        adminInProgressRequests.textContent =
            inProgress;
    }

    if (adminResolvedStatus) {
        adminResolvedStatus.textContent =
            resolved;
    }
}


/* =========================================================
   USERS
   ========================================================= */

function renderUsers(users) {

    if (!adminUsersList) {
        return;
    }

    if (!users.length) {

        adminUsersList.innerHTML = `
            <div class="admin-empty">
                No users found.
            </div>
        `;

        return;
    }

    adminUsersList.innerHTML =
        users.map(user => {

            const name =
                user.name || "Unknown User";

            const initial =
                name.trim()
                    .charAt(0)
                    .toUpperCase();

            const role =
                String(
                    user.role || "USER"
                ).toUpperCase();

            return `
                <article class="admin-user-card">

                    <div class="admin-user-info">

                        <div class="admin-user-card-avatar">
                            ${escapeHtml(initial)}
                        </div>

                        <div class="admin-user-details">

                            <strong>
                                ${escapeHtml(name)}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    user.email || "No email"
                                )}
                            </span>

                        </div>

                    </div>

                    <span class="admin-role">
                        ${escapeHtml(role)}
                    </span>

                </article>
            `;

        }).join("");
}


/* =========================================================
   REQUESTS
   ========================================================= */

function renderRequests(requests) {

    if (!adminRequestsList) {
        return;
    }

    if (!requests.length) {

        adminRequestsList.innerHTML = `
            <div class="admin-empty">
                No maintenance requests found.
            </div>
        `;

        return;
    }

    requests.sort(
        (a, b) =>
            Number(b.id) -
            Number(a.id)
    );

    adminRequestsList.innerHTML =
        requests.map(request =>
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
        "admin-status-default";

    if (status === "PENDING") {
        statusClass =
            "admin-status-pending";
    }

    if (status === "IN_PROGRESS") {
        statusClass =
            "admin-status-progress";
    }

    if (status === "RESOLVED") {
        statusClass =
            "admin-status-resolved";
    }

    const displayStatus =
        status === "IN_PROGRESS"
            ? "In Progress"
            : capitalize(
                status || "Unknown"
            );

    return `
        <article class="admin-request-card">

            <div class="admin-request-top">

                <div>

                    <div class="admin-request-title">
                        ${escapeHtml(
                            request.title ||
                            "Untitled request"
                        )}
                    </div>

                    <div class="admin-request-description">
                        ${escapeHtml(
                            request.description ||
                            "No description provided."
                        )}
                    </div>

                </div>

                <span
                    class="admin-request-status ${statusClass}"
                >
                    ${displayStatus}
                </span>

            </div>

            <div class="admin-request-details">

                <div class="admin-detail">

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

                <div class="admin-detail">

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

                <div class="admin-detail">

                    <small>
                        Student ID
                    </small>

                    <span>
                        ${request.studentId ?? "-"}
                    </span>

                </div>

                <div class="admin-detail">

                    <small>
                        Assigned Staff
                    </small>

                    <span>
                        ${getStaffName(
                            request.assignedStaffId
                        )}
                    </span>

                </div>

            </div>

            ${
                status !== "RESOLVED"
                    ? `
                        <div class="admin-assign-box">

                            <select
                                class="admin-staff-select"
                                id="staff-${request.id}"
                            >

                                <option value="">
                                    Select Staff
                                </option>

                                ${getStaffOptions(
                                    request.assignedStaffId
                                )}

                            </select>

                            <button
                                class="admin-assign-btn"
                                onclick="assignStaff(${request.id})"
                            >
                                Assign Staff
                            </button>

                        </div>
                    `
                    : `
                        <div class="admin-resolved-label">
                            ✓ Request Resolved
                        </div>
                    `
            }

        </article>
    `;
}


/* =========================================================
   STAFF ASSIGNMENT
   ========================================================= */

function getStaffUsers() {

    if (!window.adminUsers) {
        return [];
    }

    return window.adminUsers.filter(
        user =>
            String(user.role || "")
                .toUpperCase() === "STAFF"
    );
}


function getStaffOptions(assignedStaffId) {

    const staffUsers =
        getStaffUsers();

    return staffUsers.map(staff => `

        <option
            value="${staff.id}"
            ${
                Number(staff.id) ===
                Number(assignedStaffId)
                    ? "selected"
                    : ""
            }
        >
            ${escapeHtml(
                staff.name ||
                `Staff #${staff.id}`
            )}
        </option>

    `).join("");
}


function getStaffName(staffId) {

    if (
        staffId === null ||
        staffId === undefined ||
        staffId === ""
    ) {
        return "Not assigned";
    }

    const staff =
        getStaffUsers().find(
            user =>
                Number(user.id) ===
                Number(staffId)
        );

    if (staff) {

        return escapeHtml(
            staff.name ||
            `Staff #${staffId}`
        );
    }

    return `Staff #${staffId}`;
}


async function assignStaff(requestId) {

    const select =
        document.getElementById(
            `staff-${requestId}`
        );

    if (!select || !select.value) {

        alert(
            "Please select a staff member."
        );

        return;
    }

    const staffId =
        Number(select.value);

    try {

        await apiRequest(
            `/requests/${requestId}/assign?staffId=${staffId}`,
            {
                method: "PUT"
            }
        );

        alert(
            "Staff assigned successfully."
        );

        await loadAdminDashboard();

    } catch (error) {

        console.error(error);

        if (error.message === "Unauthorized") {

            logout();

            return;
        }

        alert(
            "Unable to assign staff."
        );
    }
}


/* =========================================================
   ADD STAFF
   ========================================================= */

if (addStaffButton) {

    addStaffButton.addEventListener(
        "click",
        () => {

            const name =
                prompt("Enter staff name:");

            if (!name || !name.trim()) {
                return;
            }

            const email =
                prompt("Enter staff email:");

            if (!email || !email.trim()) {
                return;
            }

            const password =
                prompt("Enter staff password:");

            if (!password || !password.trim()) {
                return;
            }

            createStaff(
                name.trim(),
                email.trim(),
                password.trim()
            );
        }
    );
}


async function createStaff(
    name,
    email,
    password
) {

    try {

        await apiRequest(
            "/users",
            {
                method: "POST",

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: "STAFF"
                })
            }
        );

        alert(
            "Staff added successfully."
        );

        await loadAdminDashboard();

    } catch (error) {

        console.error(error);

        if (
            error.message === "Unauthorized"
        ) {
            logout();
            return;
        }

        alert(
            "Unable to add staff."
        );
    }
}


/* =========================================================
   REFRESH
   ========================================================= */

if (adminRefresh) {

    adminRefresh.addEventListener(
        "click",
        async () => {

            adminRefresh.disabled = true;

            try {

                await loadAdminDashboard();

            } catch (error) {

                console.error(error);

            } finally {

                adminRefresh.disabled = false;
            }
        }
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

if (adminLogout) {

    adminLogout.addEventListener(
        "click",
        logout
    );
}


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
   API
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`,

                    ...(options.headers || {})
                }
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

        throw new Error(
            "Request failed."
        );
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