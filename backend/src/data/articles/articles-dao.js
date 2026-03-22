import { getDatabase } from "../database.js";


export async function getArticles(userId) {
  const db = await getDatabase();

  if (userId) {
  
    return await db.all(
      `SELECT  a.username, a.description, a.avatar_id ,b.article_id, b.title, b.content, b.created_dttm, b.updated_dttm, b.is_deleted, c.avatar_url , (CASE WHEN d.like_cnt is null THEN 0 ELSE d.like_cnt END) like_cnt,  (CASE WHEN e.comment_cnt is null THEN 0 ELSE e.comment_cnt END) comment_cnt, f.image_url, (CASE WHEN g.followers is null THEN 0 ELSE g.followers END) followers
      FROM users a 
      LEFT JOIN (SELECT * FROM articles WHERE is_deleted = 0 or is_deleted is null)  b on a.user_id=b.user_id 
      LEFT JOIN avatar c ON a.avatar_id=c.avatar_id 
      LEFT JOIN (SELECT article_id, COUNT(*) like_cnt FROM article_likes GROUP BY article_id) d ON b.article_id=d.article_id 
      LEFT JOIN (SELECT article_id, COUNT(*) comment_cnt FROM comments WHERE is_deleted=0 GROUP BY article_id) e ON b.article_id=e.article_id
      LEFT JOIN (SELECT article_id, image_url FROM article_images WHERE image_id=1) f ON b.article_id=f.article_id
      LEFT JOIN (SELECT target_user_id, COUNT(*) followers FROM subscriptions GROUP BY target_user_id ) g ON a.user_id=g.target_user_id
      WHERE  a.user_id = ?;`,
      [userId]
    );
  } else {
    return await db.all(
      `SELECT  b.username, b.description, b.avatar_id ,a.article_id, a.title, a.content, a.created_dttm, a.updated_dttm, a.is_deleted, c.avatar_url , (CASE WHEN d.like_cnt is null THEN 0 ELSE d.like_cnt END) like_cnt,  (CASE WHEN e.comment_cnt is null THEN 0 ELSE e.comment_cnt END) comment_cnt, f.image_url, (CASE WHEN g.followers is null THEN 0 ELSE g.followers END) followers
      FROM articles a 
      LEFT JOIN    users b on a.user_id=b.user_id 
      LEFT JOIN avatar c ON b.avatar_id=c.avatar_id 
      LEFT JOIN (SELECT article_id, COUNT(*) like_cnt FROM article_likes GROUP BY article_id) d ON a.article_id=d.article_id 
      LEFT JOIN (SELECT article_id, COUNT(*) comment_cnt FROM comments WHERE is_deleted=0 GROUP BY article_id) e ON a.article_id=e.article_id
      LEFT JOIN (SELECT article_id, image_url FROM article_images WHERE image_id=1) f ON a.article_id=f.article_id
      LEFT JOIN (SELECT target_user_id, COUNT(*) followers FROM subscriptions GROUP BY target_user_id ) g ON b.user_id=g.target_user_id
      WHERE is_deleted = 0 or is_deleted is null;`);
  }
}


export async function getArticleById(articleId) {
  const db = await getDatabase();
  return await db.get(
    `SELECT a.article_id,a.user_id, a.title, a.content, a.created_dttm, a.updated_dttm, a.is_deleted, username, description, b.avatar_id , c.avatar_url , (CASE WHEN d.like_cnt is null THEN 0 ELSE d.like_cnt END) like_cnt,  (CASE WHEN e.comment_cnt is null THEN 0 ELSE e.comment_cnt END) comment_cnt, f.image_url, (CASE WHEN g.followers is null THEN 0 ELSE g.followers END) followers
      FROM articles a 
      LEFT JOIN users b on a.user_id=b.user_id 
      LEFT JOIN avatar c ON b.avatar_id=c.avatar_id 
      LEFT JOIN (SELECT article_id, COUNT(*) like_cnt FROM article_likes GROUP BY article_id) d ON a.article_id=d.article_id 
      LEFT JOIN (SELECT article_id, COUNT(*) comment_cnt FROM comments WHERE is_deleted=0 GROUP BY article_id) e ON a.article_id=e.article_id
      LEFT JOIN (SELECT article_id, image_url FROM article_images WHERE image_id=1) f ON a.article_id=f.article_id
      LEFT JOIN (SELECT target_user_id, COUNT(*) followers FROM subscriptions GROUP BY target_user_id ) g ON a.user_id=g.target_user_id
      WHERE is_deleted = 0  and a.article_id=?;`,
    [articleId]
  );
}

export async function getArticlesByTag(tagName) {
  const db = await getDatabase();
  return await db.all(
    `SELECT a.*, d.username, e.avatar_url, f.image_url
     FROM articles a
     JOIN article_tags at ON a.article_id = at.article_id
     JOIN tags t ON at.tag_id = t.tag_id
     JOIN users d ON a.user_id = d.user_id
     JOIN avatar e ON d.avatar_id = e.avatar_id 
     LEFT JOIN (SELECT article_id, image_url FROM article_images WHERE image_id=1) f ON a.article_id=f.article_id
     WHERE LOWER(t.tag_name) = LOWER(?) 
       AND a.is_deleted = 0
     ORDER BY a.created_dttm DESC;`,
    [tagName]
  );
}


export async function getTop5Article() {
  const db = await getDatabase();
  return await db.all(
    `SELECT a.*, username,b.avatar_id , c.avatar_url , (CASE WHEN d.like_cnt is null THEN 0 ELSE d.like_cnt END) like_cnt,  (CASE WHEN e.comment_cnt is null THEN 0 ELSE e.comment_cnt END) comment_cnt, f.image_url
      FROM articles a 
      LEFT JOIN users b on a.user_id=b.user_id 
      LEFT JOIN avatar c ON b.avatar_id=c.avatar_id 
      LEFT JOIN (SELECT article_id, COUNT(*) like_cnt FROM article_likes GROUP BY article_id) d ON a.article_id=d.article_id 
      LEFT JOIN (SELECT article_id, COUNT(*) comment_cnt FROM comments WHERE is_deleted=0 GROUP BY article_id) e ON a.article_id=e.article_id
      LEFT JOIN (SELECT article_id, image_url FROM article_images WHERE image_id=1) f ON a.article_id=f.article_id
      WHERE is_deleted = 0
      ORDER BY like_cnt DESC
      LIMIT 10;`);
}


export async function getRecentArticle() {
  const db = await getDatabase();
  return await db.all(`
    SELECT a.*, username,b.avatar_id , c.avatar_url , (CASE WHEN d.like_cnt is null THEN 0 ELSE d.like_cnt END) like_cnt,  (CASE WHEN e.comment_cnt is null THEN 0 ELSE e.comment_cnt END) comment_cnt, f.image_url
      FROM articles a 
      LEFT JOIN users b on a.user_id=b.user_id 
      LEFT JOIN avatar c ON b.avatar_id=c.avatar_id 
      LEFT JOIN (SELECT article_id, COUNT(*) like_cnt FROM article_likes GROUP BY article_id) d ON a.article_id=d.article_id 
      LEFT JOIN (SELECT article_id, COUNT(*) comment_cnt FROM comments WHERE is_deleted=0 GROUP BY article_id) e ON a.article_id=e.article_id
      LEFT JOIN (SELECT article_id, image_url FROM article_images WHERE image_id=1) f ON a.article_id=f.article_id
      WHERE is_deleted = 0
      ORDER BY updated_dttm DESC
      LIMIT 10;
  `);
}

export async function softDeleteArticle(id) {
  const db = await getDatabase();

  const query = `
    UPDATE articles
    SET is_deleted = 1
    WHERE article_id = ?
  `;

  try {
    const result = await db.run(query, [id]);
    return result.changes > 0;
  } catch (err) {
    console.error('Error in softDeleteArticle:', err); 
    throw err;
  }
}


export async function insertArticle({ user_id, title, content }) {
  const db = await getDatabase();
  const sql = `INSERT INTO articles (user_id, title, content, created_dttm, updated_dttm)
               VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

  const result = await db.run(sql, [user_id, title, content]);

  const inserted = await db.get('SELECT * FROM articles WHERE article_id = ?', [result.lastID]);

  return inserted;

}



export async function updateArticle({ articleId, title, content }) {
  const db = await getDatabase();
  const sql = `
    UPDATE articles
    SET title = ?, content = ?, updated_dttm = CURRENT_TIMESTAMP
    WHERE article_id = ?
  `;
  const result = await db.run(sql, [title, content, articleId]);
  console.log('Updating article in DB:', articleId, title, content);

  return result;
}

