/**
 * Article Comments API Routes
 * This module handles all comment-related operations for articles including:
 * - Creating new comments and replies
 * - Retrieving comments for articles
 * - Deleting comments (soft delete)
 * - Toggling comment visibility (hide/restore)
 */

import express from "express";
import * as yup from "yup";
import {
  createComment,
  getCommentsByArticleId,
  deleteComment,
  toggleCommentHidden
} from "../../../../data/articles/comments/comments-dao.js";
import { getUserIdFromToken, getUsernameFromToken } from "../../auth/authfilter.js";

const router = express.Router();

// Yup validation schemas for request validation

/**
 * Validation schema for creating new comments
 * Validates comment content, parent ID, and article ID
 */
const createCommentSchema = yup.object({
  body: yup.object({
    content: yup
      .string()
      .required("Comment content is required")
      .trim()
      .min(1, "Comment content cannot be empty")
      .max(1000, "Comment content cannot exceed 1000 characters")
      .test('no-only-whitespace', 'Comment cannot contain only whitespace', (value) => {
        return value && value.trim().length > 0;
      }),
    parentId: yup
      .number()
      .integer("Parent ID must be an integer")
      .positive("Parent ID must be a positive number")
      .nullable()
      .optional()
  }),
  params: yup.object({
    articleId: yup
      .string()
      .required("Article ID is required")
      .matches(/^\d+$/, "Article ID must be a valid number")
      .test('valid-number', 'Article ID must be a valid positive integer', (value) => {
        const num = parseInt(value);
        return num > 0 && num <= Number.MAX_SAFE_INTEGER;
      })
  })
});

/**
 * Validation schema for retrieving comments
 * Validates article ID and optional include_deleted query parameter
 */
const getCommentsSchema = yup.object({
  params: yup.object({
    articleId: yup
      .string()
      .required("Article ID is required")
      .matches(/^\d+$/, "Article ID must be a valid number")
      .test('valid-number', 'Article ID must be a valid positive integer', (value) => {
        const num = parseInt(value);
        return num > 0 && num <= Number.MAX_SAFE_INTEGER;
      })
  }),
  query: yup.object({
    include_deleted: yup
      .string()
      .optional()
      .oneOf(["true", "false"], "include_deleted must be 'true' or 'false'")
  })
});

/**
 * Validation schema for deleting comments
 * Validates both article ID and comment ID parameters
 */
const deleteCommentSchema = yup.object({
  params: yup.object({
    articleId: yup
      .string()
      .required("Article ID is required")
      .matches(/^\d+$/, "Article ID must be a valid number"),
    commentId: yup
      .string()
      .required("Comment ID is required")
      .matches(/^\d+$/, "Comment ID must be a valid number")
      .test('valid-number', 'Comment ID must be a valid positive integer', (value) => {
        const num = parseInt(value);
        return num > 0 && num <= Number.MAX_SAFE_INTEGER;
      })
  })
});

/**
 * Validation schema for toggling comment visibility
 * Validates both article ID and comment ID parameters
 */
const toggleCommentSchema = yup.object({
  params: yup.object({
    articleId: yup
      .string()
      .required("Article ID is required")
      .matches(/^\d+$/, "Article ID must be a valid number"),
    commentId: yup
      .string()
      .required("Comment ID is required")
      .matches(/^\d+$/, "Comment ID must be a valid number")
      .test('valid-number', 'Comment ID must be a valid positive integer', (value) => {
        const num = parseInt(value);
        return num > 0 && num <= Number.MAX_SAFE_INTEGER;
      })
  })
});

/**
 * Validation middleware factory
 * Creates middleware function that validates requests against provided Yup schema
 * @param {Object} schema - Yup validation schema
 * @returns {Function} Express middleware function that validates req.body, req.params, and req.query
 */
const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request data against schema
      await schema.validate({
        body: req.body,
        params: req.params,
        query: req.query
      }, { 
        abortEarly: false, // Collect all validation errors
        stripUnknown: true  // Remove unknown fields
      });
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors
        });
      }
      // Handle unexpected errors during validation
      return res.status(500).json({
        status: "error",
        message: "Internal server error during validation"
      });
    }
  };
};

/**
 * POST /api/articles/:articleId/comments
 * Create a new comment for the specified article
 * Supports both top-level comments and replies (via parentId)
 * Requires authentication - user must be logged in
 */
router.post("/:articleId/comments", validateRequest(createCommentSchema), async (req, res) => {
  try {
    // Extract user ID from authentication token
    const token = req.headers.authorization;
    const userId = getUserIdFromToken(token);

    // Extract comment data from request
    const { content, parentId = null } = req.body;
    const { articleId } = req.params;

    // Additional server-side validation (redundant but provides extra safety)
    if (!content || content.trim().length === 0 || content.length > 1000) {
      return res.status(400).json({ 
        status: "error", 
        message: "Comment content must be 1–1000 characters long." 
      });
    }

    // Validate parentId if provided (for reply comments)
    if (parentId !== null && (typeof parentId !== 'number' || parentId <= 0)) {
      return res.status(400).json({ 
        status: "error", 
        message: "Parent ID must be a valid positive number." 
      });
    }

    // Create comment in database
    const comment = await createComment({ 
      articleId: parseInt(articleId), 
      userId, 
      content: content.trim(), 
      parentId 
    });
    
    return res.status(201).json({ status: "success", data: comment });
  } catch (err) {
    console.error("Error creating comment:", err);
    return res.status(403).json({ status: "error", message: err.message });
  }
});

/**
 * GET /api/articles/:articleId/comments
 * Retrieve all comments for the specified article
 * Supports optional inclusion of deleted/hidden comments via query parameter
 * Public endpoint - no authentication required
 */
router.get("/:articleId/comments", validateRequest(getCommentsSchema), async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Check if deleted comments should be included in response
    const includeDeleted = req.query.include_deleted === "true";
    
    // Fetch comments from database
    const comments = await getCommentsByArticleId(parseInt(articleId), includeDeleted);
    return res.status(200).json({ status: "success", data: comments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res.status(403).json({ status: "error", message: err.message });
  }
});

/**
 * DELETE /api/articles/:articleId/comments/:commentId
 * Soft delete a comment (marks as deleted but preserves data)
 * Only the comment author or admin can delete comments
 * Requires authentication
 */
router.delete("/:articleId/comments/:commentId", validateRequest(deleteCommentSchema), async (req, res) => {
  try {
    // Extract user ID from authentication token
    const token = req.headers.authorization;
    const userId = getUserIdFromToken(token);

    const { commentId } = req.params;
    
    // Perform soft delete operation
    await deleteComment(parseInt(commentId), userId);
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting comment:", err);
    return res.status(403).json({ status: "error", message: err.message });
  }
});

/**
 * PATCH /api/articles/:articleId/comments/:commentId
 * Toggle comment visibility (hide/restore a comment)
 * Allows moderators to hide inappropriate comments or restore hidden ones
 * Only the comment author or admin can toggle visibility
 * Requires authentication
 */
router.patch("/:articleId/comments/:commentId", validateRequest(toggleCommentSchema), async (req, res) => {
  try {
    // Extract user ID from authentication token
    const token = req.headers.authorization;
    const userId = getUserIdFromToken(token);

    const { commentId } = req.params;
    
    // Toggle comment visibility and get updated state
    const result = await toggleCommentHidden(parseInt(commentId), userId);
    const message = result.isDeleted ? "Comment hidden" : "Comment restored";
    return res.status(200).json({ status: "success", message });
  } catch (err) {
    console.error("Error toggling comment visibility:", err);
    return res.status(403).json({ status: "error", message: err.message });
  }
});

export default router;