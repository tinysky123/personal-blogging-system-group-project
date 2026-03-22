import { getDatabase } from "../database.js";
import bcrypt from 'bcryptjs';
import { DEFAULT_AVATAR_ID, getAvatarPathById } from './avatars.js';
import { searchTable, insertDataFromJson, executeParameterizedSql } from "../sql-util.js";

// Constants
const HASH_SALT_ROUNDS = 10; // Number of salt rounds for password hashing

/**
 * SQL SELECT fields for user queries
 * Maps database column names to JavaScript object properties
 */
const USER_FIELDS_SELECT = `
  user_id AS id,
  username,
  password_hash AS passwordHash,
  first_name AS firstName,
  last_name AS lastName,
  email,
  gender,
  dob,
  description,
  avatar_id AS avatarId,
  is_admin AS isAdmin
`;

/**
 * Validate required fields for user creation
 * @param {Object} userData - User data object to validate
 * @throws {Object} Throws an error object if required fields are missing
 */
function validateRequiredFields(userData) {
  const required = ['username', 'password', 'firstName', 'lastName', 'email', 'dob'];
  const missing = required.filter(field => !userData[field]);
  if (missing.length > 0) {
    throw { success: false, error: `Missing fields: ${missing.join(", ")}` };
  }
}

/**
 * Create a new user in the database
 * @param {Object} userData - User data for account creation
 * @param {string} userData.username - Username for the account
 * @param {string} userData.password - Plain text password (will be hashed)
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email address
 * @param {string} userData.dob - User's date of birth
 * @param {string} [userData.gender] - User's gender (optional)
 * @param {string} [userData.description] - User's description (optional)
 * @param {number} [userData.avatar_id] - Avatar ID (optional, defaults to DEFAULT_AVATAR_ID)
 * @param {boolean} [userData.isAdmin] - Whether user is admin (optional, defaults to false)
 * @returns {Promise<Object>} Success object with user ID, username, and avatar ID
 * @throws {Object} Throws error if username/email already exists or validation fails
 */
export async function createUser(userData) {
  const db = await getDatabase();
  
  // Validate that all required fields are present
  validateRequiredFields(userData);
  
  // Hash the password for secure storage
  const hashedPassword = await bcrypt.hash(userData.password, HASH_SALT_ROUNDS);

  try {
    // Prepare user data for database insertion
    const insertData = {
      username: userData.username,
      password_hash: hashedPassword,
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
      email: userData.email,
      gender: userData.gender || null,
      dob: userData.dob,
      description: userData.description || '',
      avatar_id: userData.avatar_id || DEFAULT_AVATAR_ID,
      is_admin: userData.isAdmin || false
    };
    
    // Insert user data into database
    const result = await insertDataFromJson(db, 'users', insertData);
    
    return {
      success: true,
      data: {
        id: result.lastID,
        username: userData.username,
        avatarId: userData.avatarId || DEFAULT_AVATAR_ID
      }
    };
  } catch (error) {
    // Handle unique constraint violations (duplicate username/email)
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw { success: false, error: 'Username or email already exists' };
    }
    throw error;
  }
}

/**
 * Check if a username is available for registration
 * @param {string} username - Username to check for availability
 * @returns {Promise<boolean>} True if username is available, false if taken
 */
export async function isUsernameAvailable(username) {
  const db = await getDatabase();
  
  // Query database for existing user with this username
  const user = await executeParameterizedSql(db, "SELECT user_id FROM users WHERE username = ?", 'get', [username]);
  
  // Return true if no user found (username available)
  return !user;
}

/**
 * Retrieve user data by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object>} Success object with user data, or failure object if not found
 */
export async function getUserByUsername(username) {
  const db = await getDatabase();
  
  // Query database for user with specified username
  const user = await executeParameterizedSql(db, `SELECT ${USER_FIELDS_SELECT} FROM users WHERE username = ?`, 'get', [username]);
  
  if (!user) {
    return { success: false };
  }
  
  return {
    success: true,
    data: user
  };
}

/**
 * Retrieve user data by user ID with avatar information
 * @param {number} userId - User ID to search for
 * @returns {Promise<Object>} Success object with user data including avatar URL
 * @throws {Object} Throws error if user not found
 */
export async function getUserById(userId) {
  const db = await getDatabase();
  
  // Query database for user with avatar information joined
  const user = await executeParameterizedSql(db, `
    SELECT 
      u.user_id AS id,
      u.username,
      u.password_hash AS passwordHash,
      u.first_name AS firstName,
      u.last_name AS lastName,
      u.email,
      u.gender,
      u.dob,
      u.description,
      u.avatar_id AS avatarId,
      a.avatar_url AS avatarUrl,
      u.is_admin AS isAdmin
    FROM users u
    LEFT JOIN Avatar a ON u.avatar_id = a.avatar_id
    WHERE u.user_id = ?
  `, 'get', [userId]);
  
  if (!user) {
    throw { success: false, error: 'User not found' };
  }
  
  return {
    success: true,
    data: { ...user, avatar: user.avatarUrl }
  };
}

/**
 * Update user profile information
 * @param {number} userId - ID of user to update
 * @param {Object} updates - Object containing fields to update
 * @param {string} [updates.username] - New username
 * @param {string} [updates.firstName] - New first name
 * @param {string} [updates.lastName] - New last name
 * @param {string} [updates.email] - New email address
 * @param {string} [updates.gender] - New gender
 * @param {string} [updates.dob] - New date of birth
 * @param {string} [updates.description] - New description
 * @param {number} [updates.avatarId] - New avatar ID
 * @returns {Promise<Object>} Updated user data
 * @throws {Object} Throws error if username already exists or user not found
 */
export async function updateUser(userId, updates) {
  const db = await getDatabase();
  
  // Get current user data to merge with updates
  const currentUser = (await getUserById(userId)).data;

  // Check if username is being changed and if new username is available
  if (updates.username && updates.username !== currentUser.username) {
    const existing = await db.get("SELECT user_id FROM users WHERE username = ?", [updates.username]);
    if (existing) {
      throw { success: false, error: "Username already exists" };
    }
  }

  // Update user record with new values or keep existing values
  await executeParameterizedSql(db, `UPDATE users SET
      username = ?, first_name = ?, last_name = ?, email = ?,
      gender = ?, dob = ?, description = ?, avatar_id = ?
     WHERE user_id = ?`, 'run',
    [
      updates.username || currentUser.username,
      updates.firstName || currentUser.firstName,
      updates.lastName || currentUser.lastName,
      updates.email || currentUser.email,
      updates.gender ?? currentUser.gender,
      updates.dob || currentUser.dob,
      updates.description || currentUser.description,
      updates.avatarId || currentUser.avatarId,
      userId
    ]);

  // Return updated user data
  return getUserById(userId);
}

/**
 * Delete a user account by user ID
 * Handles foreign key constraints and cascading deletions
 * @param {number} userId - ID of user to delete
 * @returns {Promise<Object>} Success/failure object with status and error details
 */
export async function deleteUserById(userId) {
  const db = await getDatabase();

  try {
    // Enable foreign key enforcement for proper cascading deletions
    await db.run("PRAGMA foreign_keys = ON;");
    const row = await db.get("PRAGMA foreign_keys");
    console.log("Foreign key enforcement is", row.foreign_keys ? "ON ✅" : "OFF ❌");

    console.log("Deleting user", userId);

    // Delete user record (related records will be cascaded based on foreign key constraints)
    const result = await db.run("DELETE FROM users WHERE user_id = ?", [userId]);

    // Check if user was actually deleted
    if (result.changes === 0) {
      return { success: false, error: "User not found", statusCode: 404 };
    }

    return { success: true };
  } catch (error) {
    console.error(`User deletion failed for ${userId}:`, error);
    return {
      success: false,
      error: error.message || 'Account deletion failed',
      statusCode: 500
    };
  }
}

/**
 * Get a list of article overviews with user information
 * Used for displaying article previews with author details
 * @returns {Promise<Object>} Success object with array of article overviews
 */
export async function getArticleOverviewList() {
  const db = await getDatabase();

  // Query for article overviews with user information
  const rows = await executeParameterizedSql(db, `
    SELECT 
      a.article_id AS articleId,
      u.username,
      u.avatar_id AS avatarId
    FROM articles a
    JOIN users u ON a.user_id = u.user_id
  `, 'all');
  
  // Format data with avatar paths for frontend consumption
  const demoList = rows.map(row => ({
    articleId: row.articleId,
    username: row.username,
    avatar: getAvatarPathById(row.avatarId)
  }));

  return {
    success: true,
    data: demoList
  };
}

/**
 * Get all users with follower counts
 * Note: Pagination parameters are accepted but not currently implemented
 * @param {number} page - Page number for pagination (currently unused)
 * @param {number} count - Items per page for pagination (currently unused)
 * @param {string} username - Username filter (currently unused)
 * @returns {Promise<Object>} Success object with array of users and follower counts
 */
export async function getAllUsers(page, count, username) {
  const db = await getDatabase();

  // Query for all users with their follower counts
  // Left join with subscription counts to get follower numbers
  const rows = await executeParameterizedSql(db, `
    SELECT u.*, COALESCE(sub.followers, 0) as followers FROM users u
    left join 
    (
        select target_user_id, count(*) as followers from subscriptions group by target_user_id
    ) sub on u.user_id = sub.target_user_id
  `, 'all');
  
  return {
    status: "success",
    data: rows
  };
}

/**
 * Check which usernames from a list already exist in the database
 * Used for batch username validation during registration or updates
 * @param {string[]} usernames - Array of usernames to check
 * @returns {Promise<Object>} Object containing array of existing usernames
 */
export async function checkValidUsernames(usernames) {
  const db = await getDatabase();
  
  // Create placeholders for parameterized query
  const placeholders = usernames.map(() => '?').join(',');

  // Query database for existing usernames from the provided list
  const rows = await executeParameterizedSql(db, `SELECT username FROM users WHERE username IN (${placeholders})`, 'all', usernames);
  
  // Extract usernames that already exist
  const validUsernames = rows.map(row => row.username);
  
  return {
    usernames: validUsernames
  };
}