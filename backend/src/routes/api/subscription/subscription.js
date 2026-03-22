import express from "express";
import { getUserIdFromToken } from "../auth/authfilter.js";
import * as yup from "yup";
import {
  createSubscription,
  deleteSubscription,
  getSubscriberCount,
  checkSubscription,
  getFollowingCount,
  getFollowingList,
} from "../../../data/subscription/subscription-dao.js";


const router = express.Router();


// Subscribe a user
router.post("/" ,async (req, res) => {
  try {
    const schema = yup.object().shape({
      targetUserId: yup.number().required().positive().integer(),
    });
    try {
      await schema.validate(req.body);
    } catch (validationError) {
      return res.status(400).json({ status: "error", message: validationError.message });
    }
    const token = req.headers.authorization; 

    const subscriberId = getUserIdFromToken(token);
    const { targetUserId } = req.body;

    if (!targetUserId || subscriberId === targetUserId) {
      return res.status(400).json({ status: "error", message: "Invalid target user ID" });
    }

    const subscription = await createSubscription(subscriberId, targetUserId);

    res.status(200).json({
      status: "success",
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


// Unsunscribe a user
router.delete("/:userId", async (req, res) => {
  try {
    const schema = yup.object().shape({
      userId: yup.number().required().positive().integer(),
    });
    try {
      await schema.validate({ userId: parseInt(req.params.userId) });
    } catch (validationError) {
      return res.status(400).json({ status: "error", message: validationError.message });
    }
    const token = req.headers.authorization; 
    
    const subscriberId = getUserIdFromToken(token);
    const targetUserId  = parseInt(req.params.userId);

    if (!targetUserId) {
      return res.status(400).json({ status: "error", message: "Invalid target user ID" });
    }

    await deleteSubscription(subscriberId, targetUserId);

    res.status(200).json({
      status: "success",
      message: "Subscription removed successfully",
      data: { subscriberId, targetUserId },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Get followers number
router.get("/:userId/subscribers/count", async (req, res) => {
  try {
    const schema = yup.object().shape({
      userId: yup.number().required().positive().integer(),
    });
    try {
      await schema.validate({ userId: parseInt(req.params.userId) });
    } catch (validationError) {
      return res.status(400).json({ status: "error", message: validationError.message });
    }
    const userId = parseInt(req.params.userId);
 

    const count = await getSubscriberCount(userId);

    if (count === null) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        userId,
        subscriberCount: count,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});




// Get my following count
router.get("/following/count", async (req, res) => {
  try {
    const token = req.headers.authorization; 
    const userId = getUserIdFromToken(token);
    
    const count = await getFollowingCount(userId);

    if (count === null) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        userId,
        subscriberCount: count,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


// Get the number of users I follow
router.get("/following/me", async (req, res) => {
  try {
    const token = req.headers.authorization; 
    const userId = getUserIdFromToken(token);
    
    const ret = await getFollowingList(userId);

    res.status(200).json({
      status: "success",
      data: ret,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});



// Check if subscribed
router.get("/:userId/status", async (req, res) => {
  try {
    const schema = yup.object().shape({
      userId: yup.number().required().positive().integer(),
    });
    try {
      await schema.validate({ userId: parseInt(req.params.userId) });
    } catch (validationError) {
      return res.status(400).json({ status: "error", message: validationError.message });
    }
    const token = req.headers.authorization;
    const targetUserId = parseInt(req.params.userId);
    const subscriberId =  getUserIdFromToken(token);
   
    console.log("token:", token);
    console.log("subscriberId:", subscriberId);
    console.log("targetUserId:", targetUserId);


    if (!subscriberId || !targetUserId) {
      return res.status(400).json({ status: "error", message: "Invalid parameters" });
    }

    const isSubscribed = await checkSubscription(subscriberId, targetUserId);
    res.status(200).json({
      status: "success",
      data: { isSubscribed },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;