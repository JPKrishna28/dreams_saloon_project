const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await Admin.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware to check if user is admin (can be used for additional admin-only routes)
const authenticateAdmin = async (req, res, next) => {
  try {
    // First authenticate the token
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    // Error already handled by authenticateToken
    return;
  }
};

// Middleware to check specific permissions
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // First authenticate
      await new Promise((resolve, reject) => {
        authenticateToken(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Get full user details to check permissions
      const user = await Admin.findById(req.user.userId).select('permissions');
      
      if (!user || !user.permissions || !user.permissions[permission]) {
        return res.status(403).json({
          success: false,
          message: `Permission required: ${permission}`
        });
      }

      next();
    } catch (error) {
      // Error already handled by authenticateToken
      return;
    }
  };
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  checkPermission
};