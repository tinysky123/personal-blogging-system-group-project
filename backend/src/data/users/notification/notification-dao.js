import { getDatabase } from "../../database.js";
import { deleteByFieldValue, insertDataFromJson, searchTable, searchTable2,executeParameterizedSql } from "../../sql-util.js";

//fetch all notification
export async function getNotificationsForUser(userId) {
  const db = await getDatabase();
  const notifications = await db.all(
    `
select tmp.*,u1.username as sender_username,art.title as article_title from 

(SELECT n.*, u.username AS receiver_username
     FROM notifications n
     JOIN users u ON n.receiver_id = u.user_id
     WHERE n.receiver_id = ?
  )  tmp  join users u1 on tmp.sender_id=u1.user_id
  join articles art on art.article_id=tmp.article_id`,
    [userId]
  );
  return notifications;
}


// create notification
export async function createNotification(data) {
  const {
    senderId,
    receiverId,
    type,
    articleId = null,
    commentId = null
  } = data;
  try {
  const db = await getDatabase();

  const result = await db.run(
    `INSERT INTO notifications 
     (sender_id, receiver_id, type, article_id, comment_id, is_read, created_dttm) 
     VALUES (?, ?, ?, ?, ?, 0, datetime('now'))`,
    [senderId, receiverId, type, articleId, commentId]
  );

  

  return {
    notificationId: result.lastID,
    senderId,
    receiverId,
    type,
    articleId,
    commentId,
    isRead: false,
    createdDttm: new Date().toISOString()
  };
}catch (err) {
    console.error(" DB insert error in createNotification:", err.message);
    throw err; 
  }
}

// mark as read
export async function markNotificationAsRead(notificationId) {
  const db = await getDatabase();

  await executeParameterizedSql(db, `UPDATE notifications SET is_read = 1 WHERE notification_id = ?`, 'run', notificationId);

  return await executeParameterizedSql(db, `SELECT * FROM notifications WHERE notification_id = ?`, 'get', notificationId);
}



// delete notification
export async function deleteNotification(userId) {
  const db = await getDatabase();

  await db.run(
    `delete from notifications  WHERE receiver_id = ?`,
    [userId]
  );
}



export async function notifySubscribersOnNewArticle(targetUserId, articleId) {
  const db = await getDatabase();

  try {
    const subscribers = await executeParameterizedSql(
      db,
      `SELECT subscriber_id AS subscriberId FROM subscriptions WHERE target_user_id = ?`,
      'all',
      targetUserId
    );

    if (subscribers.length === 0) {
      return { success: true, notifiedCount: 0 };
    }

    await db.exec("BEGIN TRANSACTION");

    let successCount = 0;

    for (const { subscriberId } of subscribers) {
      try {
        await executeParameterizedSql(
          db,
          `INSERT INTO notifications (receiver_id, sender_id, article_id, type)
           VALUES (?, ?, ?, 'new_article')`,
          'run',
          subscriberId,
          targetUserId,
          articleId
        );
        successCount++;
      } catch (err) {
        console.warn(`⚠️ Failed to notify ${subscriberId}:`, err.message);
      }
    }

    await db.exec("COMMIT");

    return { success: true, notifiedCount: successCount };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

