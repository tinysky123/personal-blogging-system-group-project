import { getDatabase } from "../../database.js";
import { insertDataFromJson, updateDatabase ,executeParameterizedSql} from "../../sql-util.js";
import { getUserById } from "../../users/users-dao.js";

/**
 * Insert a new comment into the database.
 * @param {Object} param0 - Comment data.
 * @param {number} param0.articleId - ID of the article.
 * @param {number} param0.userId - ID of the commenter.
 * @param {string} param0.content - Content of the comment.
 * @param {number|null} param0.parentId - ID of parent comment or null.
 * @returns {Object} The inserted comment data.
 */
export async function createComment({ articleId, userId, content, parentId = null }) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const insertData = {
    article_id: articleId,
    user_id: userId,
    content,
    parent_id: parentId,
    created_dttm: now,
    updated_dttm: now,
    is_deleted: 0
  };
  
  // Insert comment data first
  const result = await insertDataFromJson(db, "comments", insertData);
  const commentId = result.lastID;
  
  // Get user information
  const user = (await getUserById(userId)).data;
  const username = user.username;
  const avatarUrl = user.avatar;
  
  // Return complete comment information
  return {
    commentId: commentId,
    articleId: articleId,
    userId: userId,
    content,
    parentId: parentId,
    createdDttm: now,
    updatedDttm: now,
    isDeleted: 0,
    username,
    avatarUrl: avatarUrl
  };
}

/**
 * Retrieve comments for a specific article.
 * @param {number} articleId - ID of the article.
 * @param {boolean} includeDeleted - Whether to include soft-deleted comments.
 * @returns {Array} List of comments.
 */
export async function getCommentsByArticleId(articleId, includeDeleted = false) {
  const db = await getDatabase();
  
  // Query basic comment information only
  const sql = `
    SELECT c.*
    FROM comments c 
    WHERE c.article_id = ?
    ${includeDeleted ? "" : "AND c.is_deleted = 0"}
    ORDER BY c.created_dttm ASC
  `;
  
  const comments = await executeParameterizedSql(db,sql,'all', articleId);
  
  // Get user information for each comment
  const commentsWithUserInfo = await Promise.all(
    comments.map(async (comment) => {
      try {
        const user = (await getUserById(comment.user_id)).data;
        const username = user.username;
        const avatarUrl = user.avatar;
        
        return {
          commentId: comment.comment_id,
          articleId: comment.article_id,
          userId: comment.user_id,
          content: comment.content,
          parentId: comment.parent_id,
          createdDttm: comment.created_dttm,
          updatedDttm: comment.updated_dttm,
          isDeleted: comment.is_deleted,
          username,
          avatarUrl: avatarUrl
        };
      } catch (error) {
        console.error(`Failed to get user info for user_id ${comment.user_id}:`, error);
        // If failed to get user info, return default values
        return {
          commentId: comment.comment_id,
          articleId: comment.article_id,
          userId: comment.user_id,
          content: comment.content,
          parentId: comment.parent_id,
          createdDttm: comment.created_dttm,
          updatedDttm: comment.updated_dttm,
          isDeleted: comment.is_deleted,
          username: 'Unknown User',
          avatarUrl: null
        };
      }
    })
  );
  
  return commentsWithUserInfo;
}

/**
 * Mark a comment as soft-deleted (is_deleted = 1).
 * @param {number} commentId - ID of the comment to delete.
 * @param {number} userId - ID of the user performing the deletion.
 * @returns {Object} A success message.
 */
export async function deleteComment(commentId, userId) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const updateData = {
    is_deleted: 1,
    updated_dttm: now
  };
  const result = await updateDatabase(db, "comments", updateData, commentId, "comment_id");
  if (result.changes === 0) {
    throw new Error("No comment deleted. It may not exist or you are not the owner.");
  }
  return { message: "Comment deleted" };
}

/**
 * Toggle the soft-deleted state of a comment.
 * @param {number} commentId - ID of the comment.
 * @param {number} userId - User performing the toggle.
 * @returns {Object} The updated isDeleted status.
 */
export async function toggleCommentHidden(commentId, userId) {
  const db = await getDatabase();
  const comment = await executeParameterizedSql(db,
    `SELECT is_deleted FROM comments WHERE comment_id = ? AND user_id = ?`,'get',
    [commentId, userId]
  );
  if (!comment) {
    throw new Error("Comment not found or not owned by user.");
  }
  const now = new Date().toISOString();
  const newStatus = comment.is_deleted ? 0 : 1;
  const updateData = {
    is_deleted: newStatus,
    updated_dttm: now
  };
  await updateDatabase(db, "comments", updateData, commentId, "comment_id");
  return { commentId, isDeleted: !!newStatus };
}