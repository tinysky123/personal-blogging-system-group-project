import express from "express";
import { createNotification, markNotificationAsRead,getNotificationsForUser,deleteNotification } from "../../../../data/users/notification/notification-dao.js";
import { getUserIdFromToken } from "../../auth/authfilter.js";
import * as yup from "yup";
import { getUserByUsername } from "../../../../data/users/users-dao.js";
const router = express.Router();


console.log("Notification router loaded"); 


// Create Notification
router.post("/", async (req, res) => {
  const schema = yup.object().shape({
    receiverId: yup.number().positive().integer().nullable(),
    receiverName: yup.string().nullable(),
    type: yup.string().required(),
    articleId: yup.number().positive().integer().nullable(),
    commentId: yup.number().positive().integer().nullable()
  });

  try {
    await schema.validate(req.body, { abortEarly: false });

    const token = req.headers.authorization;
    const senderId = getUserIdFromToken(token);

    let { receiverId, receiverName, type, articleId, commentId } = req.body;

    if (receiverName) {
      const result = await getUserByUsername(receiverName);
      if (!result.success || !result.data) {
        return res.status(404).json({ status: "error", message: "User not found" });
      } else {
        receiverId = result.data.id;
      }
    }

    const notification = await createNotification({
      senderId,
      receiverId,
      type,
      articleId,
      commentId
    });

    res.status(200).json({
      status: "success",
      message: "Notification created successfully",
      data: notification
    });

  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({
      status: "error",
      message: err.name === "ValidationError" ? "Request validation failed" : "Failed to create notification",
      errors: err.errors || err.message
    });
  }
});

// Mark as read
router.post("/mark-read", async (req, res) => {
  const schema = yup.object().shape({
    id: yup.number().positive().integer().required()
  });

  try {
    await schema.validate(req.body, { abortEarly: false });

    const { id } = req.body;
    const updated = await markNotificationAsRead(id);

    res.status(200).json({ status: "success", data: updated });

  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "Request validation failed",
        errors: err.errors
      });
    }

    console.error("Failed to mark notification as read:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});




//Get all notification
router.get("/me", async (req, res) => {
  console.log("GET /notification endpoint hit"); 
  try {
    const token = req.headers.authorization;
    const userId = getUserIdFromToken(
      req.headers.authorization || req.headers.Authorization
    );
    console.log("Decoded userId:", userId);  

    const notifications = await getNotificationsForUser(userId);
    
    console.log("Notifications from DB:", notifications);

    
    res.json({ status: "success", notifications });
  } catch (err) {
    console.error("Notification fetch error:", err);  
    res.status(500).json({ status: "error", message: err.message });
  }
});

//Clear all notification
router.delete("/me", async (req, res) => {
  const userId = getUserIdFromToken(
    req.headers.authorization || req.headers.Authorization
  );
  if (!userId) return res.status(401).json({ status: 'error', message: 'unauthorized' });

  deleteNotification(userId);
  res.status(204).end();
});

export default router;