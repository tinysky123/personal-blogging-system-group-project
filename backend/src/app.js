import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public/images/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// Set's our port to the PORT environment variable, or 3000 by default if the env is not configured.
const PORT = process.env.PORT ?? 3000;

// Creates the express server
const app = express();

/**
 * Configure middleware (logging, CORS support, JSON parsing support,
 * static files support, cookie parser)
 *
 * CORS is configured to allow cookies and these two origins from fetch() requests.
 * Feel free to reconfigure if required, or add your own middleware.
 */
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: [`http://localhost:${PORT}`, process.env.FRONTEND_ORIGIN],
    credentials: true
  })
);

app.use(express.json({ limit: '20mb' }));

app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static("public"));


import { authenticateToken } from "./routes/api/auth/authfilter.js";

// Import and use our application routes.
import routes from "./routes/routes.js";

app.use("/api", authenticateToken, routes);



app.use("/image", express.static(path.join(process.cwd(), "public/images/avatars")));
app.use("/uploads", express.static(path.join(process.cwd(), "public/images/uploads")));





// Start the server running.
app.listen(PORT, () => {
  console.log(`PGCIT Final Project server listening on port ${PORT}`);
});