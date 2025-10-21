const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errorMessages
    });
  }
  
  next();
};

// Admin validation rules
const validateAdminRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  
  handleValidationErrors
];

const validateAdminLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Customer validation rules
const validateCustomer = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('address')
    .optional({ checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  
  handleValidationErrors
];

// Employee validation rules
const validateEmployee = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isIn(['Senior Barber', 'Junior Barber', 'Apprentice', 'Manager', 'Receptionist'])
    .withMessage('Invalid position'),
  
  body('salary')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  
  body('hireDate')
    .isISO8601()
    .withMessage('Please provide a valid hire date'),
  
  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),
  
  body('specializations.*')
    .optional()
    .isIn(['Hair Cut', 'Hair Wash', 'Beard Trim', 'Mustache Trim', 'Hair Styling', 'Hair Coloring', 'Facial', 'Head Massage'])
    .withMessage('Invalid specialization'),
  
  body('workSchedule.*.day')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day in work schedule'),
  
  body('workSchedule.*.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('workSchedule.*.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  handleValidationErrors
];

// Appointment validation rules
const validateAppointment = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 100 })
    .withMessage('Customer name must be less than 100 characters'),
  
  body('customerPhone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected'),
  
  body('services.*')
    .isIn(['Hair Cut', 'Hair Wash', 'Beard Trim', 'Mustache Trim', 'Hair Styling', 'Hair Coloring', 'Facial', 'Head Massage'])
    .withMessage('Invalid service selected'),
  
  body('appointmentDateTime')
    .isISO8601()
    .withMessage('Please provide a valid appointment date and time')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      if (appointmentDate <= now) {
        throw new Error('Appointment must be scheduled for a future date and time');
      }
      return true;
    }),
  
  body('employeeId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid employee ID'),
  
  body('notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  
  handleValidationErrors
];

// Billing validation rules
const validateBilling = [
  body('appointmentId')
    .isMongoId()
    .withMessage('Invalid appointment ID'),
  
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be billed'),
  
  body('services.*.name')
    .trim()
    .notEmpty()
    .withMessage('Service name is required'),
  
  body('services.*.price')
    .isFloat({ min: 0 })
    .withMessage('Service price must be a positive number'),
  
  body('paymentMethod')
    .isIn(['Cash', 'Card', 'UPI', 'Bank Transfer'])
    .withMessage('Invalid payment method'),
  
  body('discount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateAdminRegistration,
  validateAdminLogin,
  validateCustomer,
  validateEmployee,
  validateAppointment,
  validateBilling,
  validateObjectId
};