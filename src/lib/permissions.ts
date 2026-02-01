/**
 * Permission utility for role-based access control
 */

import type { UserRole } from "@/entities/User";

/**
 * Check if current user can manage a target user's role
 * @param currentUserRole - Role of the user performing the action
 * @param targetUserRole - Role of the user being managed
 * @returns true if action is allowed
 */
export function canManageUserRole(
    currentUserRole: UserRole | null | undefined,
    targetUserRole: UserRole | null | undefined
): boolean {
    // Handle null/undefined
    if (!currentUserRole || !targetUserRole) {
        return false;
    }

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
export function getAvailableRoles(currentUserRole: UserRole | null | undefined): UserRole[] {
    // Handle null/undefined
    if (!currentUserRole) {
        return [];
    }

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
export function canAccessUserManagement(userRole: UserRole | null | undefined): boolean {
    // Handle null/undefined
    if (!userRole) {
        return false;
    }

    return ["admin", "reception"].includes(userRole);
}
