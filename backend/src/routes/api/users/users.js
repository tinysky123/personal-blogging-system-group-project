import express from "express";
import * as yup from 'yup';
import { 
  createUser, 
  getUserById, 
  getUserByUsername, 
  updateUser, 
  deleteUserById, 
  getArticleOverviewList,
  getAllUsers,
  checkValidUsernames
} from "../../../data/users/users-dao.js";
import { getAvatarPathById } from "../../../data/users/avatars.js";
import { getDatabase } from "../../../data/database.js";

const router = express.Router();

// Yup validation schemas
/**
 * Basic user validation schema
 * Validates that user object is present
 */
const userSchema = yup.object().shape({
  user: yup.object().required()
});

/**
 * User registration validation schema
 * Validates that userData object is present
 */
const userDataSchema = yup.object().shape({
  userData: yup.object().required()
});

/**
 * POST /api/users/
 * User registration endpoint (Public)
 * Creates a new user account with provided user data
 */
router.post("/", async (req, res) => {
  // Validate request body structure
  try {
    await userDataSchema.validate({ userData: req.body });
  } catch (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  
  try {
    const userData = req.body;

    // Check if username already exists
    const existingUser = await getUserByUsername(userData.username);
    if (existingUser.success) {
      return res.status(400).json({ status: "error", message: "Username already exists" });
    }

    // Create new user
    const result = await createUser(userData);
    res.status(201).json({
      status: "success",
      data: {
        id: result.data.id,
        username: result.data.username,
        avatar_id: result.data.avatarId
      }
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ status: "error", message: error.error });
  }
});

/**
 * GET /api/users/avatars
 * Get list of available avatars (Public)
 * Returns all avatar options for user profile pictures
 */
router.get("/avatars", async (req, res) => {
  try {
    // Query database for all available avatars
    const db = await getDatabase();
    const rows = await db.all("SELECT avatar_id, avatar_url FROM Avatar");

    // Format avatar data for frontend consumption
    const avatars = rows.map(row => ({
      avatar_id: row.avatar_id,
      filename: row.avatar_url.split('/').pop(),
      url: row.avatar_url
    }));

    res.json({
      status: "success",
      data: avatars
    });
  } catch (err) {
    console.error("Failed to load avatars from database:", err);
    res.status(500).json({ status: "error", message: "Failed to load avatars" });
  }
});

/**
 * GET /api/users/me
 * Get current user profile (Authenticated)
 * Returns the authenticated user's profile information
 */
router.get("/me", async (req, res) => {
  try {
    // Read current user's ID from JWT payload injected by global filter
    const user = await getUserById(req.user.userId);
    
    res.json({
      status: "success",
      data: {
        id: user.data.id,
        username: user.data.username,
        realName: user.data.firstName + " " + user.data.lastName,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        email: user.data.email,
        gender: user.data.gender,
        dob: user.data.dob,
        description: user.data.description,
        avatarId: user.data.avatarId,
        subscriptions: 0,
        subscribers: 0,
        articleCount: 0
      }
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ status: "error", message: error.error });
  }
});

/**
 * User profile update validation schema
 * Validates optional fields for profile updates
 */
const updateUserSchema = yup.object({
  username: yup.string().optional(),
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  email: yup.string().email().optional(),
  gender: yup.string().oneOf(["M", "F", "O", ""]).optional(),
  dob: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  description: yup.string().optional(),
  avatarId: yup.number().integer().positive().optional()
});

/**
 * PATCH /api/users/me
 * Update user profile (Authenticated)
 * Updates the authenticated user's profile with provided data
 */
router.patch("/me", async (req, res) => {
  try {
    // Validate and sanitize input data
    const validatedData = await updateUserSchema.validate(req.body, { abortEarly: false });

    // Update user profile in database
    await updateUser(req.user.userId, validatedData);

    res.json({
      status: "success",
      data: { updatedFields: Object.keys(validatedData) }
    });

  } catch (error) {
    const msg = error.message || error.error;
    const status = error.name === "ValidationError" ? 400 : (error.statusCode || 500);
    res.status(status).json({ status: "error", message: msg });
  }
});

/**
 * Avatar update validation schema
 * Validates avatar ID for avatar updates
 */
const updateAvatarSchema = yup.object().shape({
  avatarId: yup.number().integer().positive().required()
});

/**
 * PATCH /api/users/me/avatar
 * Update user avatar (Authenticated)
 * Updates the authenticated user's avatar
 */
router.patch("/me/avatar", async (req, res) => {
  // Validate avatar ID
  try {
    await updateAvatarSchema.validate(req.body);
  } catch (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  
  try {
    // Update user's avatar in database
    await updateUser(req.user.userId, { avatarId: req.body.avatarId });
    res.json({
      status: "success",
      data: { avatar: req.body.avatarId }
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ status: "error", message: error.error });
  }
});

/**
 * DELETE /api/users/me
 * Delete user account (Authenticated self-delete)
 * Allows users to delete their own account
 */
router.delete("/me", async (req, res) => {
  try {
    // Delete the authenticated user's account
    await deleteUserById(req.user.userId);
  } catch (error) {
    return res.status(error.statusCode || 400).json({ status: "error", message: error.error });
  }
  res.status(204).end();
});

/**
 * DELETE /api/users/:id
 * Admin deletes any user (Admin only)
 * Allows administrators to delete any user account
 */
router.delete("/:id", async (req, res) => {
  try {
    // Delete specified user account
    await deleteUserById(req.params.id);
  } catch (error) {
    return res.status(error.statusCode || 400).json({ status: "error", message: error.error });
  }
  res.status(204).end();
});

/**
 * GET /api/users/articles-overview
 * Get article overview list (Public)
 * Returns overview data for articles page
 */
router.get("/articles-overview", async (req, res) => {
  try {
    // Fetch article overview data
    const result = await getArticleOverviewList();
    res.json(result.data);
  } catch (error) {
    res.status(error.statusCode || 400).json({ status: "error", message: error.error });
  }
});

/**
 * User ID validation schema
 * Validates user ID parameter
 */
const userIdSchema = yup.object().shape({
  userId: yup.number().integer().positive().required()
});

/**
 * GET /api/users/:userId
 * Get user details by ID (Public)
 * Returns public profile information for specified user
 */
router.get("/:userId", async (req, res) => {
  // Validate user ID parameter
  try {
    await userIdSchema.validate({ userId: parseInt(req.params.userId) });
  } catch (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  
  try {
    // Fetch user profile data
    const user = await getUserById(parseInt(req.params.userId));
    return res.json({
      userId: user.data.id,
      username: user.data.username,
      realName: `${user.data.firstName} ${user.data.lastName}`,
      dob: user.data.dob,
      description: user.data.description,
      avatarUrl: user.data.avatar
    });
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: err.error || "Unauthorized: Invalid or missing token"
    });
  }
});

/**
 * Pagination validation schema
 * Validates pagination parameters for user list
 */
const paginationSchema = yup.object({
  page: yup.number().integer().positive().default(1),
  pageSize: yup.number().integer().positive().default(10)
});

/**
 * GET /api/users/
 * Get paginated user list (Public)
 * Returns a paginated list of users with optional username filtering
 */
router.get("/", async (req, res) => {
  try {
    // Validate and set pagination parameters
    const { page, pageSize } = await paginationSchema.validate(req.query, {
      stripUnknown: true, 
      abortEarly: false
    });

    // Extract optional username filter
    const username = req.query.username || "";

    // Fetch paginated user list
    const result = await getAllUsers(page, pageSize, username);
    
    // Format user data for frontend
    const formattedUsers = result.data.map(user => ({
      userId: user.user_id,
      username: user.username,
      realName: `${user.first_name} ${user.last_name}`,
      dob: user.dob,
      description: user.description,
      followers: user.followers
    }));

    return res.json({
      status: "success",
      data: formattedUsers,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message
    });
  }
});

/**
 * Username validation schema
 * Validates array of usernames for batch validation
 */
const usernameSchema = yup.object().shape({
  usernames: yup.array().min(1).required()
});

/**
 * POST /api/users/batch-validate-usernames
 * Batch validate usernames (Public)
 * Validates multiple usernames at once for availability checking
 */
router.post("/batch-validate-usernames", async (req, res) => {
  // Validate request body
  try {
    await usernameSchema.validate(req.body);
  } catch (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
  
  const { usernames } = req.body;
  try {
    // Check username availability in batch
    const result = await checkValidUsernames(usernames);

    return res.json({
      status: "success",
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.error || "Failed to get user list"
    });
  }
});

export default router;