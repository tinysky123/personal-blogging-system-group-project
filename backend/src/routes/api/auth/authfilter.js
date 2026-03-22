import jwt from "jsonwebtoken";

/**
 * Authentication middleware that validates JWT tokens and manages access control
 * Supports three types of requests: public, admin-only, and authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticateToken = (req, res, next) => {
    console.log(req.method + ":" + req.path);
    
    // Get public and admin request patterns from environment variables
    const publicRequests = process.env.AUTH_PUBLIC_REQUEST ? process.env.AUTH_PUBLIC_REQUEST.split(',') : [];
    const adminRequests = process.env.AUTH_ADMIN_REQUEST ? process.env.AUTH_ADMIN_REQUEST.split(',') : [];
    const token = req.headers.authorization;
    
    /**
     * Helper function to match request against a list of patterns
     * @param {Array} requestList - Array of request patterns in format "METHOD:PATH"
     * @returns {boolean} True if request matches any pattern in the list
     */
    const matchRequest = (requestList) => {
        for (const pattern of requestList) {
            const [method, pathPattern] = pattern.trim().split(':');
            
            // Check if HTTP method matches
            if (method.toLowerCase() !== req.method.toLowerCase()) continue;

            // Convert path pattern to regex (replace {id} placeholders with \d+)
            const regexPattern = pathPattern.replace(/{[^}]*Id}/g, '\\d+');
            const regex = new RegExp(`^${regexPattern}$`);

            // Test if current path matches the pattern
            if (regex.test(req.path)) {
                return true;
            }
        }
        return false;
    };

    // Check if request is public (no authentication required)
    if (matchRequest(publicRequests)) {
        return next();
    }

    // Check if request requires admin privileges
    if (matchRequest(adminRequests)) {
        if (!token) {
            return res.status(401).json({ status: "error", message: "No token provided" });
        }

        try {
            // Verify JWT token and check for admin role
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if (decoded.roles.includes('admin')) {
                req.user = decoded;
                return next();
            } else {
                return res.status(403).json({ status: "error", message: "You do not have admin privileges" });
            }
        } catch (err) {
            // Handle token verification errors
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ status: "error", message: "The session has expired" });
            }
            return res.status(401).json({ status: "error", message: "Invalid token" });
        }
    }

    // Handle general authenticated requests
    if (!token) {
        return res.status(401).json({ status: "error", message: "No token provided" });
    }

    try {
        // Verify JWT token for general authenticated requests
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        // Handle token verification errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ status: "error", message: "The session has expired" });
        }
        return res.status(401).json({ status: "error", message: "Invalid token" });
    }
};

/**
 * Create a JWT token with user information
 * @param {string} username - The username to include in the token
 * @param {Array} roles - Array of user roles (e.g., ["admin"])
 * @param {number} userId - The user's unique identifier
 * @returns {string} Signed JWT token
 */
export const createJwtToken = (username, roles, userId) => {
    const payload = {
        username,
        roles,
        userId
    };
    const secretKey = process.env.JWT_SECRET_KEY;
    const options = {
        expiresIn: `${process.env.SESSION_TIMEOUT}m` // Token expiration time in minutes
    };
    return jwt.sign(payload, secretKey, options);
};

/**
 * Extract user ID from a JWT token
 * @param {string} token - The JWT token to decode
 * @returns {number|null} User ID if token is valid, null if invalid or expired
 */
export const getUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded.userId;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('Token has expired:', err);
        } else {
            console.error('An error occurred when verifying the token:', err);
        }
        return null;
    }
};

/**
 * Extract username from a JWT token
 * @param {string} token - The JWT token to decode
 * @returns {string|null} Username if token is valid, null if invalid or expired
 */
export const getUsernameFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded.username;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('Token has expired:', err);
        } else {
            console.error('An error occurred when verifying the token:', err);
        }
        return null;
    }
};

/**
 * Extract user roles from a JWT token
 * @param {string} token - The JWT token to decode
 * @returns {Array|null} Array of user roles if token is valid, null if invalid or expired
 */
export const getRolesFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded.roles;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('Token has expired:', err);
        } else {
            console.error('An error occurred when verifying the token:', err);
        }
        return null;
    }
};