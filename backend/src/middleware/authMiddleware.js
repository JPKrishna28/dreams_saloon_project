const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

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
    
    let user;
    
    // Check user type and find appropriate user
    if (decoded.userType === 'staff') {
      user = await Employee.findById(decoded.userId).select('-loginCredentials.password -__v');
      if (!user || !user.isActive || !user.loginCredentials?.isLoginEnabled) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or staff access disabled'
        });
      }
    } else {
      // Default to admin
      user = await Admin.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found'
        });
      }
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      userType: decoded.userType || 'admin',
      permissions: decoded.permissions || user.permissions,
      userData: user
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
      message: 'Authentication error'
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
      // Authentication should already be done by authenticateToken
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has the required permission
      if (!req.user.permissions || !req.user.permissions[permission]) {
        return res.status(403).json({
          success: false,
          message: `Permission required: ${permission}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Middleware to check user roles
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Convert single role to array for consistency
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient role level.'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking role'
      });
    }
  };
};

// Combined middleware for role and permission checking
const authorize = (options = {}) => {
  return async (req, res, next) => {
    try {
      const { roles, permissions, requireAll = false } = options;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check roles if specified
      if (roles) {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient role level.'
          });
        }
      }

      // Check permissions if specified
      if (permissions) {
        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
        const userPermissions = req.user.permissions || {};

        if (requireAll) {
          // All permissions must be present
          const hasAllPermissions = requiredPermissions.every(perm => userPermissions[perm] === true);
          if (!hasAllPermissions) {
            return res.status(403).json({
              success: false,
              message: 'Access denied. Missing required permissions.'
            });
          }
        } else {
          // At least one permission must be present
          const hasAnyPermission = requiredPermissions.some(perm => userPermissions[perm] === true);
          if (!hasAnyPermission) {
            return res.status(403).json({
              success: false,
              message: 'Access denied. Required permissions not found.'
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Admin only middleware
const adminOnly = checkRole(['admin']);

// Manager or Admin middleware
const managerOrAdmin = checkRole(['admin', 'manager']);

// Staff level middleware (all roles)
const staffAccess = checkRole(['admin', 'manager', 'staff']);

module.exports = {
  authenticateToken,
  authenticateAdmin,
  checkPermission,
  checkRole,
  authorize,
  adminOnly,
  managerOrAdmin,
  staffAccess
};