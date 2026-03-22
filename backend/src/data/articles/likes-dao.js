
import { getDatabase } from "../database.js";
import { deleteByFieldValue, insertDataFromJson, searchTable, searchTable2,executeParameterizedSql } from "../sql-util.js";



export async function getLike(articleId) {
  const db = await getDatabase();
  return await executeParameterizedSql(
    db,
    "SELECT article_id, COUNT(user_id) like_cnt FROM article_likes WHERE article_id = ? GROUP BY article_id",
    "get",
    articleId
  );
}

export async function likeArticle(articleId, userId) {
  const db = await getDatabase();
  const sql = `
    INSERT INTO article_likes(article_id, user_id, created_dttm)
    VALUES (?, ?, CURRENT_TIMESTAMP);
  `;
  const result = await executeParameterizedSql(
    db,
    sql,
    "run",
    articleId,
    userId
  );
  console.log("Liked article:", articleId);
  return result;
}

export async function deleteLike(articleId, userId) {
  const db = await getDatabase();
  const sql = `
    DELETE FROM article_likes
    WHERE article_id = ? AND user_id = ?;
  `;
  const result = await executeParameterizedSql(
    db,
    sql,
    "run",
    articleId,
    userId
  );
  console.log("Unliked article:", articleId);
  return result;
}

export async function hasUserLikedArticle(articleId, userId) {
  const db = await getDatabase();
  const row = await executeParameterizedSql(
    db,
    `SELECT 1 FROM article_likes WHERE article_id = ? AND user_id = ?`,
    "get",
    articleId,
    userId
  );
  return !!row;
}