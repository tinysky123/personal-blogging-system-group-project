import express from "express";
import { getUserByUsername } from "../../../data/users/users-dao.js";
import bcrypt from 'bcryptjs';
import { createJwtToken } from "./authfilter.js";
const router = express.Router();
import yup from 'yup';

/**
 * Generate a hashed password using bcryptjs
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
export const generateHashedPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    console.log("hash:", hash);
    return hash;
};

/**
 * GET /api/auth/
 * Health check endpoint for authentication service
 */
router.get("/", (req, res) => {
    res.status(200).json({ message: "hello,auth" });
});

// Yup validation schemas
/**
 * Validation schema for login request
 * Validates the username field in request body
 */
const previousSchema = yup.object().shape({  
  username: yup.string().max(20, 'The length of the user name cannot exceed 20 characters').required()
});

/**
 * Validation schema for logout request
 * Validates the authorization header is present
 */
const deleteSchema = yup.object().shape({  
  headers: yup.object().shape({  
    authorization: yup.string().required('Authorization can not be empty')  
  }).required()
});

/**
 * POST /api/auth/
 * User login endpoint
 * Authenticates user credentials and returns JWT token
 */
router.post("/", async (req, res) => {  
  try {    
    // Validate request body using yup schema
    await previousSchema.validate(req.body);    
        const { username, password } = req.body;
        
        // Retrieve user from database by username
        const result = await getUserByUsername(username);

        // Check if user exists
        if (!result.success || !result.data) {
            return res.status(401).json({ status: "error", message: "The username or password is incorrect" });
        }

        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, result.data.passwordHash);

        // Check if password is valid
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "The username or password is incorrect" });
        }

        // Determine user roles based on admin status
        const roles = result.data.isAdmin ? ["admin"] : [];
        
        // Create JWT token with user information
        const tokenId = createJwtToken(username, roles, result.data.id);

        // Return successful login response with token and user data
        res.status(200).json({ 
            status: "success",
            tokenId: tokenId,
            userId: result.data.id,
            username: result.data.username,
            roles
        });
    } catch (error) {    
        // Handle validation errors
        return res.status(400).json({ error: error.message });  
    }
});

/**
 * DELETE /api/auth/
 * User logout endpoint
 * Validates token presence and logs out user
 */
router.delete("/", async (req, res) => {  
  try {    
    // Validate request headers using yup schema
    await deleteSchema.validate(req);    
    
    // Return successful logout response (token invalidation handled on client side)
    res.status(204).end();
  } catch (error) {   
    // Handle validation errors
    return res.status(400).json({ error: error.message });  
  }
});

export default router;
