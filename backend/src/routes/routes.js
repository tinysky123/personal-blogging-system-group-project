import express from "express";

/**
 * Create a new express Router
 */
const router = express.Router();

/**
 * This route handler will respond to a GET request to the "/" path (e.g. http://localhost:3000/). It will
 * return an HTTP 200 (OK) response with the given JSON data.
 */
router.get("/", (req, res) => {
  /**
   * res.json() will return a 200 OK response, with Content-Type = application/json, and a JSON string equal
   * to the result of calling JSON.stringify() on the given JavaScript object.
   */
  return res.json({ message: "Hello, world!" });
});

/**
 * Add child routes
 */
import apiRoutes from "./api/api.js";
router.use("/", apiRoutes);

import commentRoutes from "./api/articles/comments/comments.js";
import articleRoutes from "./api/articles/articles.js";
import tagsRoutes from "./api/articles/tags/tags.js";

router.use("/articles", (req, res, next) => {
  if (req.path.includes('tags')) {
    tagsRoutes(req, res, next);
  } else if(req.path.includes('comments')){
    commentRoutes(req, res, next);
  } else{
    articleRoutes(req, res, next);
  }
});
router.use("/tags", tagsRoutes);

import authRoutes from "./api/auth/auth.js";
router.use("/auth", authRoutes);

import subscriptionRoutes from "./api/subscription/subscription.js";
router.use("/subscription", subscriptionRoutes);

import notificationRoutes from "./api/users/notification/notification.js";
import usersRoutes from "./api/users/users.js";

// router.use("/users/notifications", notificationRoutes);

router.use("/users", (req, res, next) => {
  if (req.path.includes('subscribers')) {
    subscriptionRoutes(req, res, next);
  } else{
    usersRoutes(req, res, next);
  }
});


router.use("/notification", notificationRoutes);


/**
 * Export the router so it can be used outside.
 */
export default router;