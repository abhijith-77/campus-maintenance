
const API_BASE_URL = "https://campus-maintenance-e9ql.onrender.com";

const token = sessionStorage.getItem("campusfix_token");

if (!token) {
    window.location.href = "login.html";
}

/* ELEMENTS */
const adminWelcomeName = document.getElementById("adminWelcomeName");
const adminSidebarName = document.getElementById("adminSidebarName");
const adminTopAvatar = document.getElementById("adminTopAvatar");
const adminSidebarAvatar = document.getElementById("adminSidebarAvatar");

const adminTotalUsers = document.getElementById("adminTotalUsers");
const adminTotalStaff = document.getElementById("adminTotalStaff");
const adminTotalRequests = document.getElementById("adminTotalRequests");
const adminResolvedRequests = document.getElementById("adminResolvedRequests");
const adminPendingRequests = document.getElementById("adminPendingRequests");
const adminInProgressRequests = document.getElementById("adminInProgressRequests");
const adminResolvedStatus = document.getElementById("adminResolvedStatus");

const adminUsersList = document.getElementById("adminUsersList");
const adminRequestsList = document.getElementById("adminRequestsList");
const adminRefresh = document.getElementById("adminRefresh");
const adminLogout = document.getElementById("adminLogout");
const addStaffButton = document.getElementById("addStaffButton");

window.adminUsers = [];

/* LOAD DASHBOARD */
document.addEventListener("DOMContentLoaded", loadAdminDashboard);

async function loadAdminDashboard() {
    try {
        const users = await apiRequest("/users");
        const requests = await apiRequest("/requests");

        if (!Array.isArray(users) || !Array.isArray(requests)) {
            throw new Error("Unexpected data returned by the server.");
        }

        window.adminUsers = users;

        setAdminDetails(users);
        updateStatistics(users, requests);
        renderUsers(users);
        renderRequests(requests);

    } catch (error) {
        console.error("Admin dashboard loading error:", error);

        if (adminUsersList) {
            adminUsersList.innerHTML = `
                <div class="admin-empty">
                    Unable to load users. ${escapeHtml(error.message)}
                </div>`;
        }

        if (adminRequestsList) {
            adminRequestsList.innerHTML = `
                <div class="admin-empty">
                    Unable to load maintenance requests.
                </div>`;
        }

        if (error.message === "Unauthorized") {
            logout();
        }
    }
}

/* ADMIN DETAILS */
function setAdminDetails(users) {
    const payload = decodeJwtPayload(token);
    let admin = null;

    if (payload?.sub) {
        admin = users.find(
            user => user.email?.toLowerCase() ===
                String(payload.sub).toLowerCase()
        );
    }

    if (!admin) {
        admin = users.find(
            user => String(user.role || "").toUpperCase() === "ADMIN"
        );
    }

    const name = admin?.name || "Administrator";
    const initial = name.trim().charAt(0).toUpperCase() || "A";

    if (adminWelcomeName) adminWelcomeName.textContent = name;
    if (adminSidebarName) adminSidebarName.textContent = name;
    if (adminTopAvatar) adminTopAvatar.textContent = initial;
    if (adminSidebarAvatar) adminSidebarAvatar.textContent = initial;
}

/* STATISTICS */
function updateStatistics(users, requests) {
    const totalStaff = users.filter(
        user => ["STAFF", "MAINTENANCE"].includes(
            String(user.role || "").toUpperCase()
        )
    ).length;

    const pending = requests.filter(
        request => normalizeStatus(request.status) === "PENDING"
    ).length;

    const inProgress = requests.filter(
        request => normalizeStatus(request.status) === "IN_PROGRESS"
    ).length;

    const resolved = requests.filter(
        request => normalizeStatus(request.status) === "RESOLVED"
    ).length;

    if (adminTotalUsers) adminTotalUsers.textContent = users.length;
    if (adminTotalStaff) adminTotalStaff.textContent = totalStaff;
    if (adminTotalRequests) adminTotalRequests.textContent = requests.length;
    if (adminResolvedRequests) adminResolvedRequests.textContent = resolved;
    if (adminPendingRequests) adminPendingRequests.textContent = pending;
    if (adminInProgressRequests) adminInProgressRequests.textContent = inProgress;
    if (adminResolvedStatus) adminResolvedStatus.textContent = resolved;
}

/* USERS */
function renderUsers(users) {
    if (!adminUsersList) return;

    if (!users.length) {
        adminUsersList.innerHTML =
            '<div class="admin-empty">No users found.</div>';
        return;
    }

    adminUsersList.innerHTML = users.map(user => {
        const name = user.name || "Unknown User";
        const initial = name.trim().charAt(0).toUpperCase();
        const role = String(user.role || "USER").toUpperCase();

        return `
            <article class="admin-user-card">
                <div class="admin-user-info">
                    <div class="admin-user-card-avatar">
                        ${escapeHtml(initial)}
                    </div>
                    <div class="admin-user-details">
                        <strong>${escapeHtml(name)}</strong>
                        <span>${escapeHtml(user.email || "No email")}</span>
                    </div>
                </div>
                <span class="admin-role">${escapeHtml(role)}</span>
            </article>`;
    }).join("");
}

/* MAINTENANCE REQUESTS */
function renderRequests(requests) {
    if (!adminRequestsList) return;

    if (!requests.length) {
        adminRequestsList.innerHTML =
            '<div class="admin-empty">No maintenance requests found.</div>';
        return;
    }

    const sortedRequests = [...requests].sort(
        (a, b) => Number(b.id) - Number(a.id)
    );

    adminRequestsList.innerHTML = sortedRequests
        .map(createRequestCard).join("");
}

function createRequestCard(request) {
    const status = normalizeStatus(request.status);

    const statusClasses = {
        PENDING: "admin-status-pending",
        IN_PROGRESS: "admin-status-progress",
        RESOLVED: "admin-status-resolved"
    };

    const statusClass = statusClasses[status] || "admin-status-default";
    const displayStatus = status === "IN_PROGRESS"
        ? "In Progress"
        : capitalize(status || "Unknown");

    const staffControls = status !== "RESOLVED"
        ? `
            <div class="admin-assign-box">
                <select class="admin-staff-select" id="staff-${Number(request.id)}">
                    <option value="">Select Staff</option>
                    ${getStaffOptions(request.assignedStaffId)}
                </select>
                <button class="admin-assign-btn"
                    onclick="assignStaff(${Number(request.id)})">
                    Assign Staff
                </button>
            </div>`
        : '<div class="admin-resolved-label">✓ Request Resolved</div>';

    return `
        <article class="admin-request-card">
            <div class="admin-request-top">
                <div>
                    <div class="admin-request-title">
                        ${escapeHtml(request.title || "Untitled request")}
                    </div>
                    <div class="admin-request-description">
                        ${escapeHtml(request.description || "No description provided.")}
                    </div>
                </div>
                <span class="admin-request-status ${statusClass}">
                    ${escapeHtml(displayStatus)}
                </span>
            </div>

            <div class="admin-request-details">
                <div class="admin-detail">
                    <small>Location</small>
                    <span>${escapeHtml(request.location || "Not specified")}</span>
                </div>
                <div class="admin-detail">
                    <small>Category</small>
                    <span>${escapeHtml(request.category || "Other")}</span>
                </div>
                <div class="admin-detail">
                    <small>Student ID</small>
                    <span>${escapeHtml(request.studentId ?? "-")}</span>
                </div>
                <div class="admin-detail">
                    <small>Assigned Staff</small>
                    <span>${getStaffName(request.assignedStaffId)}</span>
                </div>
            </div>
            ${staffControls}
        </article>`;
}

/* STAFF HELPERS */
function getStaffUsers() {
    return window.adminUsers.filter(user =>
        ["STAFF", "MAINTENANCE"].includes(
            String(user.role || "").toUpperCase()
        )
    );
}

function getStaffOptions(assignedStaffId) {
    return getStaffUsers().map(staff => `
        <option value="${Number(staff.id)}"
            ${Number(staff.id) === Number(assignedStaffId) ? "selected" : ""}>
            ${escapeHtml(staff.name || `Staff #${staff.id}`)}
        </option>`
    ).join("");
}

function getStaffName(staffId) {
    if (staffId === null || staffId === undefined || staffId === "") {
        return "Not assigned";
    }

    const staff = getStaffUsers().find(
        user => Number(user.id) === Number(staffId)
    );

    return staff
        ? escapeHtml(staff.name || `Staff #${staffId}`)
        : `Staff #${Number(staffId)}`;
}

/* ASSIGN STAFF */
async function assignStaff(requestId) {
    const select = document.getElementById(`staff-${requestId}`);

    if (!select || !select.value) {
        alert("Please select a staff member.");
        return;
    }

    const staffId = Number(select.value);

    try {
        await apiRequest(
            `/requests/${requestId}/assign?staffId=${staffId}`,
            { method: "PUT" }
        );

        alert("Staff assigned successfully.");
        await loadAdminDashboard();

    } catch (error) {
        console.error("Staff assignment failed:", error);

        if (error.message === "Unauthorized") {
            logout();
            return;
        }

        alert(`Unable to assign staff: ${error.message}`);
    }
}

/* ADD STAFF */
if (addStaffButton) {
    addStaffButton.addEventListener("click", async () => {
        const name = prompt("Enter staff name:");
        if (!name?.trim()) return;

        const email = prompt("Enter staff email:");
        if (!email?.trim()) return;

        const password = prompt("Enter staff password:");
        if (!password) return;

        try {
            await apiRequest("/users", {
                method: "POST",
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                    role: "STAFF"
                })
            });

            alert("Staff added successfully.");
            await loadAdminDashboard();

        } catch (error) {
            console.error("Adding staff failed:", error);

            if (error.message === "Unauthorized") {
                logout();
                return;
            }

            alert(`Unable to add staff: ${error.message}`);
        }
    });
}

/* REFRESH */
if (adminRefresh) {
    adminRefresh.addEventListener("click", async () => {
        adminRefresh.disabled = true;

        try {
            await loadAdminDashboard();
        } finally {
            adminRefresh.disabled = false;
        }
    });
}

/* LOGOUT */
if (adminLogout) {
    adminLogout.addEventListener("click", logout);
}

function logout() {
    sessionStorage.removeItem("campusfix_token");
    sessionStorage.removeItem("campusfix_role");
    window.location.href = "login.html";
}

/* API REQUEST */
async function apiRequest(endpoint, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(options.headers || {})
            }
        });
    } catch (error) {
        console.error(`Network error calling ${endpoint}:`, error);
        throw new Error(
            "Cannot connect to the backend. Check the backend URL and CORS settings."
        );
    }

    if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(
            `${endpoint} failed (HTTP ${response.status})` +
            (details ? `: ${details.slice(0, 180)}` : "")
        );
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`${endpoint} returned an invalid JSON response.`);
    }
}

/* JWT PAYLOAD */
function decodeJwtPayload(jwt) {
    try {
        const parts = jwt.split(".");
        if (parts.length !== 3) return null;

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded = base64.padEnd(
            base64.length + (4 - base64.length % 4) % 4,
            "="
        );

        return JSON.parse(atob(padded));
    } catch (error) {
        console.error("Unable to decode JWT:", error);
        return null;
    }
}

/* HELPERS */
function normalizeStatus(status) {
    return String(status || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
}

function capitalize(value) {
    if (!value) return "";
    return value.charAt(0) + value.slice(1).toLowerCase();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
