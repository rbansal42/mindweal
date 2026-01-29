/**
 * Permission utility for role-based access control
 */

export type UserRole = "client" | "therapist" | "admin" | "reception";

/**
 * Check if current user can manage a target user's role
 * @param currentUserRole - Role of the user performing the action
 * @param targetUserRole - Role of the user being managed
 * @returns true if action is allowed
 */
export function canManageUserRole(
    currentUserRole: string,
    targetUserRole: string
): boolean {
    // Admin can manage everyone
    if (currentUserRole === "admin") {
        return true;
    }

    // Reception can only manage clients
    if (currentUserRole === "reception" && targetUserRole === "client") {
        return true;
    }

    return false;
}

/**
 * Get available roles that current user can assign
 * @param currentUserRole - Role of the user performing the action
 * @returns Array of role options
 */
export function getAvailableRoles(currentUserRole: string): UserRole[] {
    if (currentUserRole === "admin") {
        return ["client", "therapist", "reception", "admin"];
    }

    if (currentUserRole === "reception") {
        return ["client"];
    }

    return [];
}

/**
 * Check if user can access user management
 * @param userRole - Role to check
 * @returns true if user can access user management
 */
export function canAccessUserManagement(userRole: string): boolean {
    return ["admin", "reception"].includes(userRole);
}
