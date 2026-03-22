/**
 * User API utility functions
 * This module provides wrapper functions for all user-related API endpoints
 * Handles user registration, authentication, profile management, and account operations
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "$lib/api/api.js";

/**
 * User Registration API
 * Creates a new user account with the provided user data
 * This is a public endpoint that doesn't require authentication
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Unique username for the account
 * @param {string} userData.password - User's password (will be hashed on backend)
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email address
 * @param {string} userData.gender - User's gender (M/F/O)
 * @param {string} userData.dob - User's date of birth (YYYY-MM-DD format)
 * @param {string} userData.description - User's profile description
 * @param {number} userData.avatarId - Selected avatar ID
 * @returns {Promise<Object>} API response with registration result
 */
export const register = async (userData) => {
  return await apiPost("/users", {
    username: userData.username,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    gender: userData.gender,
    dob: userData.dob,
    description: userData.description,
    avatar_id: userData.avatarId
  });
};

/**
 * Username Availability Check API
 * Checks if a username is already taken by existing users
 * This is a public endpoint used for real-time validation during registration
 * 
 * @param {string} username - Username to check for availability
 * @returns {Promise<number|null>} Number of existing users with this username (0 = available, >0 = taken)
 */
export const checkUsername = async (username) => {
  // Return null if no username provided
  if (!username) return null;
  
  // Use batch validation endpoint to check single username
  const res = await apiPost("/users/batch-validate-usernames", {
    usernames: [username]
  });
  
  // Return count of existing usernames (0 means available)
  return res.data.usernames.length;
};

/**
 * Get User Profile API
 * Retrieves the authenticated user's complete profile information
 * Requires valid authentication token
 * 
 * @returns {Promise<Object>} API response with user profile data
 */
export const getProfile = async () => {
  return await apiGet("/users/me");
};

/**
 * Update User Profile API
 * Updates the authenticated user's profile with provided changes
 * Only sends fields that have been modified
 * Requires valid authentication token
 * 
 * @param {Object} updates - Object containing fields to update
 * @param {string} [updates.username] - New username
 * @param {string} [updates.firstName] - New first name
 * @param {string} [updates.lastName] - New last name
 * @param {string} [updates.email] - New email address
 * @param {string} [updates.gender] - New gender
 * @param {string} [updates.dob] - New date of birth
 * @param {string} [updates.description] - New profile description
 * @param {number} [updates.avatarId] - New avatar ID
 * @returns {Promise<Object>} API response with update result
 */
export const updateProfile = async (updates) => {
  return await apiPatch("/users/me", updates);
};

/**
 * Update User Avatar API
 * Updates the authenticated user's avatar to a new selection
 * Requires valid authentication token
 * 
 * @param {number} avatar - New avatar ID to set for the user
 * @returns {Promise<Object>} API response with avatar update result
 */
export const updateAvatar = async (avatar) => {
  return await apiPatch("/users/me/avatar", { avatar });
};

/**
 * User Logout API
 * Logs out the authenticated user and invalidates their session
 * Requires valid authentication token
 * 
 * @returns {Promise<Object>} API response confirming logout
 */
export const logout = async () => {
  return await apiDelete("/auth");
};

/**
 * Delete User Account API
 * Permanently deletes the authenticated user's account and all associated data
 * This action cannot be undone
 * Requires valid authentication token
 * 
 * @returns {Promise<Object>} API response confirming account deletion
 */
export const deleteAccount = async () => {
  return await apiDelete("/users/me");
};

/**
 * Token Validation API
 * Validates the current authentication token and refreshes session if needed
 * Used to check if user is still authenticated
 * Requires valid authentication token
 * 
 * @returns {Promise<Object>} API response with token validation result
 */
export const validateToken = async () => {
  return await apiPost("/auth");
};