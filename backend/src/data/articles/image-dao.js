
import { getDatabase } from "../database.js";
import { deleteByFieldValue, insertDataFromJson, searchTable, searchTable2,executeParameterizedSql } from "../sql-util.js";


export async function insertArticleImage(article_id, image_url) {
  const db = await getDatabase();

  const row = await executeParameterizedSql(
    db,
    `SELECT MAX(image_id) as maxId FROM article_images WHERE article_id = ?`,
    'get',
    article_id
  );
  const image_id = (row?.maxId || 0) + 1;

  await executeParameterizedSql(
    db,
    `INSERT INTO article_images (article_id, image_id, image_url, created_dttm)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    'run',
    article_id,
    image_id,
    image_url
  );

  const inserted = await executeParameterizedSql(
    db,
    `SELECT * FROM article_images WHERE article_id = ? AND image_id = ?`,
    'get',
    article_id,
    image_id
  );

  return inserted;
}

export async function getArticleImages(article_id) {
  const db = await getDatabase();

  const rows = await executeParameterizedSql(
    db,
    `SELECT image_id, image_url 
     FROM article_images 
     WHERE article_id = ?
     ORDER BY image_id ASC`,
    'all',
    article_id
  );

  return rows.map(row => ({
    image_id: row.image_id,
    image_url: row.image_url,
  }));
}

export async function deleteArticleImage(article_id, image_id) {
  const db = await getDatabase();

  const result = await executeParameterizedSql(
    db,
    `DELETE FROM article_images 
     WHERE article_id = ? AND image_id = ?`,
    'run',
    article_id,
    image_id
  );

  return {
    success: result.changes > 0,
    deletedCount: result.changes
  };
}

  