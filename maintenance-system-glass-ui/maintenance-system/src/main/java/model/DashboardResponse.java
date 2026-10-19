package Campus.Maintenance.System.model;

public class DashboardResponse {

    private long totalUsers;
    private long totalStaff;
    private long totalRequests;
    private long pendingRequests;
    private long inProgressRequests;
    private long resolvedRequests;

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalStaff() {
        return totalStaff;
    }

    public void setTotalStaff(long totalStaff) {
        this.totalStaff = totalStaff;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getInProgressRequests() {
        return inProgressRequests;
    }

    public void setInProgressRequests(long inProgressRequests) {
        this.inProgressRequests = inProgressRequests;
    }

    public long getResolvedRequests() {
        return resolvedRequests;
    }

    public void setResolvedRequests(long resolvedRequests) {
        this.resolvedRequests = resolvedRequests;
    }
}