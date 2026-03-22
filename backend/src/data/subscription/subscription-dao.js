
import { getDatabase } from "../database.js";
import { deleteByFieldValue, insertDataFromJson, searchTable, searchTable2,executeParameterizedSql } from "../sql-util.js";

// Create a subscription
export async function createSubscription(subscriberId, targetUserId) {
  const db = await getDatabase();

  const existing = await executeParameterizedSql(
    db,
    "SELECT * FROM Subscriptions WHERE subscriber_id = ? AND target_user_id = ?",
    "get",
    subscriberId,
    targetUserId
  );

  if (existing) {
    return res.status(200).json({
      status: "already_subscribed",
      message: "Already subscribed to this user"
    });
  }

  const createdDttm = new Date().toISOString();

  const result = await executeParameterizedSql(
    db,
    "INSERT INTO Subscriptions (subscriber_id, target_user_id, created_dttm) VALUES (?, ?, ?)",
    "run",
    subscriberId,
    targetUserId,
    createdDttm
  );

  return {
    subscription_id: result.lastID,
    subscriber_id: subscriberId,
    target_user_id: targetUserId,
    created_dttm:createdDttm,
  };
}

// Delete subscription
export async function deleteSubscription(subscriberId, targetUserId) {
  const db = await getDatabase();

  const result = await executeParameterizedSql(
    db,
    "DELETE FROM subscriptions WHERE subscriber_id = ? AND target_user_id = ?",
    "run",
    subscriberId,
    targetUserId
  );

  if (result.changes === 0) {
    throw new Error("Subscription not found");
  }
}

// Get a user’s follower count (number of subscribers)
export async function getSubscriberCount(userId) {
  const db = await getDatabase();

  const user = await executeParameterizedSql(
    db,
    "SELECT * FROM users WHERE user_id = ?",
    "get",
    userId
  );

  if (!user) return null;

  const row = await executeParameterizedSql(
    db,
    "SELECT COUNT(*) as count FROM subscriptions WHERE target_user_id = ?",
    "get",
    userId
  );

  return row.count;
}

// Get following count
export async function getFollowingCount(userId) {
  const db = await getDatabase();

  const row = await executeParameterizedSql(
    db,
    "SELECT COUNT(*) as count FROM subscriptions WHERE subscriber_id = ?",
    "get",
    userId
  );

  return row.count;
}

// Get following list
export async function getFollowingList(userId) {
  const db = await getDatabase();

  const rows = await executeParameterizedSql(
    db,
    `SELECT u.user_id,u.username,ava.avatar_url
     FROM subscriptions sub 
     JOIN users u ON sub.target_user_id = u.user_id
     JOIN Avatar ava ON u.avatar_id = ava.avatar_id
     WHERE sub.subscriber_id = ?`,
    "all",
    userId
  );

  return rows;
}

// Check if the current user has subscribed to a target user
export async function checkSubscription(subscriberId, targetUserId) {
  const db = await getDatabase();

  const result = await executeParameterizedSql(
    db,
    "SELECT 1 FROM Subscriptions WHERE subscriber_id = ? AND target_user_id = ?",
    "get",
    subscriberId,
    targetUserId
  );

  return !!result;
}