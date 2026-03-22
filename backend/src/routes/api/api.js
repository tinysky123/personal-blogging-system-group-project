import express from "express";
const router = express.Router();

import articleRoutes from "./articles/articles.js";
router.use("/articles", articleRoutes);

import authRoutes from "./auth/auth.js";
router.use("/auth", authRoutes);

// import usersRoutes from "./users/users.js";
// router.use("/users", usersRoutes);

router.get("/", (req, res) => {
  return res.json({ message: "Hello, world33!" });
});

export default router;