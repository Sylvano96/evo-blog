package com.example.SpringBoot.security;

import com.example.SpringBoot.domain.Roles;

/** The authenticated caller, available through {@code @AuthenticationPrincipal}. */
public record AuthUser(Integer id, String role) {

    public boolean isAdmin() {
        return Roles.ADMIN.equals(role);
    }

    /** True if the caller owns the resource, or is an administrator. */
    public boolean canManage(Integer ownerId) {
        return isAdmin() || (ownerId != null && ownerId.equals(id));
    }
}
