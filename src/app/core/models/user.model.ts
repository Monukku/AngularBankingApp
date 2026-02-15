import { KeycloakProfile } from 'keycloak-js';

/**
 * Base User Profile from Keycloak
 */
export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  preferredUsername?: string;
  givenName?: string;
  familyName?: string;
  name?: string;
  roles?: string[];
  attributes?: Record<string, string | string[] | number | boolean>;
  realmAccess?: {
    roles: string[];
  };
  clientId?: string;
}

/**
 * User Details for Profile Management
 */
export interface UserDetails extends UserProfile {
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User Preferences
 */
export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark';
  language: string;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

/**
 * Legacy interfaces for backward compatibility
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  roles?: string[];
}

export interface AuthUser extends User {
  token?: string;
  refreshToken?: string;
}

/**
 * Map KeycloakProfile to UserProfile
 * Handles optional fields from Keycloak and provides defaults
 */
export function mapKeycloakProfileToUserProfile(
  keycloakProfile: KeycloakProfile
): UserProfile {
  return {
    id: keycloakProfile.id,
    username: keycloakProfile.username ?? 'unknown',
    email: keycloakProfile.email ?? '',
    firstName: keycloakProfile.firstName,
    lastName: keycloakProfile.lastName,
    emailVerified: keycloakProfile.emailVerified,
    preferredUsername: keycloakProfile.username,
    givenName: keycloakProfile.firstName,
    familyName: keycloakProfile.lastName,
    name: keycloakProfile.firstName && keycloakProfile.lastName
      ? `${keycloakProfile.firstName} ${keycloakProfile.lastName}`
      : keycloakProfile.username ?? 'Unknown User',
    attributes: keycloakProfile.attributes as Record<string, string | string[] | number | boolean>, // ✅ Type assertion
  };
}

/**
 * Get user display name with fallback
 */
export function getUserDisplayName(profile: UserProfile): string {
  if (profile.name) return profile.name;
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  if (profile.firstName) return profile.firstName;
  if (profile.preferredUsername) return profile.preferredUsername;
  if (profile.username) return profile.username;
  return 'Unknown User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(profile: UserProfile): string {
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  }
  if (profile.username) {
    return profile.username.substring(0, 2).toUpperCase();
  }
  return 'U';
}