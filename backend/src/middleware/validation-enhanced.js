import Joi from 'joi';
import { body, validationResult } from 'express-validator';

// Custom validation functions
const isValidGSTIN = (value, helpers) => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const isValidPAN = (value, helpers) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const isValidIndianPhone = (value, helpers) => {
  const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const isValidHSNCode = (value, helpers) => {
  const hsnRegex = /^[0-9]{4,8}$/;
  if (!hsnRegex.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Joi schemas
export const schemas = {
  // Auth schemas
  login: Joi.object({
    email: Joi.string()
      .email()
      .normalize()
      .required()
      .messages({
        'string.email': 'Valid email is required',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
      }),
    twoFactorCode: Joi.string()
      .length(6)
      .pattern(/^[0-9]{6}$/)
      .optional()
      .messages({
        'string.length': '2FA code must be 6 digits',
        'string.pattern.base': '2FA code must contain only numbers'
      })
  }),

  register: Joi.object({
    companyName: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Company name is required',
        'string.max': 'Company name must be less than 100 characters',
        'any.required': 'Company name is required'
      }),
    companyEmail: Joi.string()
      .email()
      .normalize()
      .required()
      .messages({
        'string.email': 'Valid company email is required',
        'any.required': 'Company email is required'
      }),
    adminName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Admin name is required',
        'string.max': 'Admin name must be less than 50 characters',
        'any.required': 'Admin name is required'
      }),
    adminEmail: Joi.string()
      .email()
      .normalize()
      .required()
      .messages({
        'string.email': 'Valid admin email is required',
        'any.required': 'Admin email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    phone: Joi.string()
      .custom(isValidIndianPhone)
      .optional()
      .messages({
        'any.invalid': 'Valid Indian phone number required (10 digits starting with 6-9, or +91 followed by 10 digits)'
      }),
    gstin: Joi.string()
      .custom(isValidGSTIN)
      .optional()
      .messages({
        'any.invalid': 'Valid GSTIN required'
      }),
    pan: Joi.string()
      .custom(isValidPAN)
      .optional()
      .messages({
        'any.invalid': 'Valid PAN required'
      })
  }),

  // Contact schemas
  contact: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Contact name is required',
        'string.max': 'Contact name must be less than 100 characters',
        'any.required': 'Contact name is required'
      }),
    email: Joi.string()
      .email()
      .normalize()
      .optional()
      .messages({
        'string.email': 'Valid email required'
      }),
    phone: Joi.string()
      .custom(isValidIndianPhone)
      .optional()
      .messages({
        'any.invalid': 'Valid Indian phone number required'
      }),
    gstin: Joi.string()
      .custom(isValidGSTIN)
      .optional()
      .messages({
        'any.invalid': 'Valid GSTIN required'
      }),
    pan: Joi.string()
      .custom(isValidPAN)
      .optional()
      .messages({
        'any.invalid': 'Valid PAN required'
      }),
    isCustomer: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isCustomer must be boolean'
      }),
    isVendor: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isVendor must be boolean'
      }),
    creditLimit: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Credit limit must be positive'
      }),
    paymentTerms: Joi.number()
      .integer()
      .min(0)
      .max(365)
      .optional()
      .messages({
        'number.min': 'Payment terms must be positive',
        'number.max': 'Payment terms cannot exceed 365 days'
      })
  }),

  // Product schemas
  product: Joi.object({
    sku: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'SKU is required',
        'string.max': 'SKU must be less than 50 characters',
        'any.required': 'SKU is required'
      }),
    name: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Product name is required',
        'string.max': 'Product name must be less than 200 characters',
        'any.required': 'Product name is required'
      }),
    description: Joi.string()
      .trim()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Description must be less than 1000 characters'
      }),
    salePrice: Joi.number()
      .min(0)
      .precision(2)
      .required()
      .messages({
        'number.min': 'Sale price must be positive',
        'any.required': 'Sale price is required'
      }),
    purchasePrice: Joi.number()
      .min(0)
      .precision(2)
      .required()
      .messages({
        'number.min': 'Purchase price must be positive',
        'any.required': 'Purchase price is required'
      }),
    unit: Joi.string()
      .trim()
      .min(1)
      .max(20)
      .optional()
      .messages({
        'string.min': 'Unit is required',
        'string.max': 'Unit must be less than 20 characters'
      }),
    hsnCode: Joi.string()
      .custom(isValidHSNCode)
      .optional()
      .messages({
        'any.invalid': 'Valid HSN code required (4-8 digits)'
      }),
    isService: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isService must be boolean'
      }),
    trackInventory: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'trackInventory must be boolean'
      }),
    currentStock: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Current stock must be positive'
      }),
    minStockLevel: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Minimum stock level must be positive'
      })
  }),

  // Transaction schemas
  transaction: Joi.object({
    type: Joi.string()
      .valid('SALES_ORDER', 'PURCHASE_ORDER', 'INVOICE', 'BILL', 'PAYMENT', 'RECEIPT', 'JOURNAL')
      .required()
      .messages({
        'any.only': 'Valid transaction type required',
        'any.required': 'Transaction type is required'
      }),
    contactId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Valid contact ID required'
      }),
    date: Joi.date()
      .iso()
      .max('now')
      .optional()
      .messages({
        'date.format': 'Valid date required',
        'date.max': 'Date cannot be in the future'
      }),
    dueDate: Joi.date()
      .iso()
      .min(Joi.ref('date'))
      .optional()
      .messages({
        'date.format': 'Valid due date required',
        'date.min': 'Due date must be after transaction date'
      }),
    reference: Joi.string()
      .trim()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Reference must be less than 100 characters'
      }),
    notes: Joi.string()
      .trim()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Notes must be less than 1000 characters'
      }),
    items: Joi.array()
      .items(
        Joi.object({
          description: Joi.string()
            .trim()
            .min(1)
            .max(200)
            .required()
            .messages({
              'string.min': 'Item description is required',
              'string.max': 'Item description must be less than 200 characters',
              'any.required': 'Item description is required'
            }),
          quantity: Joi.number()
            .min(0.001)
            .precision(3)
            .required()
            .messages({
              'number.min': 'Item quantity must be positive',
              'any.required': 'Item quantity is required'
            }),
          rate: Joi.number()
            .min(0)
            .precision(2)
            .required()
            .messages({
              'number.min': 'Item rate must be positive',
              'any.required': 'Item rate is required'
            }),
          productId: Joi.string()
            .uuid()
            .optional()
            .messages({
              'string.guid': 'Valid product ID required'
            }),
          taxId: Joi.string()
            .uuid()
            .optional()
            .messages({
              'string.guid': 'Valid tax ID required'
            })
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one item is required',
        'any.required': 'Items are required'
      })
  }),

  // Tax schemas
  tax: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Tax name is required',
        'string.max': 'Tax name must be less than 100 characters',
        'any.required': 'Tax name is required'
      }),
    type: Joi.string()
      .valid('GST', 'CGST', 'SGST', 'IGST', 'VAT', 'TDS', 'OTHER')
      .required()
      .messages({
        'any.only': 'Valid tax type required',
        'any.required': 'Tax type is required'
      }),
    rate: Joi.number()
      .min(0)
      .max(100)
      .precision(2)
      .required()
      .messages({
        'number.min': 'Tax rate must be positive',
        'number.max': 'Tax rate cannot exceed 100%',
        'any.required': 'Tax rate is required'
      }),
    description: Joi.string()
      .trim()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Description must be less than 500 characters'
      }),
    isCompound: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isCompound must be boolean'
      }),
    isActive: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isActive must be boolean'
      })
  }),

  // Account schemas
  account: Joi.object({
    code: Joi.string()
      .trim()
      .min(1)
      .max(20)
      .required()
      .messages({
        'string.min': 'Account code is required',
        'string.max': 'Account code must be less than 20 characters',
        'any.required': 'Account code is required'
      }),
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Account name is required',
        'string.max': 'Account name must be less than 100 characters',
        'any.required': 'Account name is required'
      }),
    type: Joi.string()
      .valid('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CONTRA_ASSET', 'CONTRA_LIABILITY')
      .required()
      .messages({
        'any.only': 'Valid account type required',
        'any.required': 'Account type is required'
      }),
    parentId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Valid parent account ID required'
      }),
    description: Joi.string()
      .trim()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Description must be less than 500 characters'
      }),
    openingBalance: Joi.number()
      .precision(2)
      .optional()
      .messages({
        'number.base': 'Opening balance must be a number'
      }),
    isActive: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isActive must be boolean'
      })
  }),

  // Password change schema
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Confirm password must match new password',
        'any.required': 'Confirm password is required'
      })
  }),

  // 2FA setup schema
  setup2FA: Joi.object({
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required for 2FA setup'
      })
  }),

  // 2FA verification schema
  verify2FA: Joi.object({
    token: Joi.string()
      .length(6)
      .pattern(/^[0-9]{6}$/)
      .required()
      .messages({
        'string.length': '2FA code must be 6 digits',
        'string.pattern.base': '2FA code must contain only numbers',
        'any.required': '2FA code is required'
      })
  })
};

// Validation middleware factory
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input and try again',
        details: errorDetails
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Enhanced express-validator middleware for backward compatibility
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input and try again',
      details: errorDetails
    });
  }
  next();
};

// Sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.trim().replace(/\s+/g, ' ');
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
      const sanitized = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          sanitized[key] = sanitizeValue(value[key]);
        }
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

export default {
  schemas,
  validate,
  handleValidationErrors,
  sanitizeInput
};
