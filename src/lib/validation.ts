// Frontend validation utilities
import { useState } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Indian-specific validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+91[-\s]?)?[6-9]\d{9}$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  hsnCode: /^[0-9]{4,8}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  accountNumber: /^[0-9]{9,18}$/,
  pinCode: /^[1-9][0-9]{5}$/,
  aadhar: /^[2-9]{1}[0-9]{11}$/,
  uan: /^[0-9]{12}$/,
};

// Validation rules for different field types
export const VALIDATION_RULES: Record<string, ValidationRule> = {
  // Basic fields
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Name is required and must be between 1-100 characters'
  },
  email: {
    required: false,
    pattern: VALIDATION_PATTERNS.email,
    message: 'Please enter a valid email address'
  },
  phone: {
    required: false,
    minLength: 10,
    maxLength: 15,
    message: 'Please enter a valid phone number (10-15 digits)'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters'
  },
  simplePassword: {
    required: true,
    minLength: 4,
    message: 'Password must be at least 4 characters'
  },
  
  // Indian business fields - simplified for easy signup
  gstin: {
    required: false,
    maxLength: 15,
    message: 'GSTIN should be 15 characters or less'
  },
  pan: {
    required: false,
    maxLength: 10,
    message: 'PAN should be 10 characters or less'
  },
  hsnCode: {
    required: false,
    pattern: VALIDATION_PATTERNS.hsnCode,
    message: 'Please enter a valid HSN code (4-8 digits)'
  },
  
  // Address fields
  city: {
    required: false,
    maxLength: 50,
    message: 'City name must be less than 50 characters'
  },
  state: {
    required: false,
    maxLength: 50,
    message: 'State name must be less than 50 characters'
  },
  pinCode: {
    required: false,
    pattern: VALIDATION_PATTERNS.pinCode,
    message: 'Please enter a valid PIN code (6 digits)'
  },
  
  // Financial fields
  amount: {
    required: true,
    custom: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return 'Amount must be a positive number';
      }
      if (num > 999999999) {
        return 'Amount is too large';
      }
      return null;
    }
  },
  quantity: {
    required: true,
    custom: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Quantity must be a positive number';
      }
      if (num > 999999) {
        return 'Quantity is too large';
      }
      return null;
    }
  },
  rate: {
    required: true,
    custom: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return 'Rate must be a positive number';
      }
      if (num > 999999) {
        return 'Rate is too large';
      }
      return null;
    }
  },
  percentage: {
    required: false,
    custom: (value: any) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 100) {
        return 'Percentage must be between 0 and 100';
      }
      return null;
    }
  },
  
  // Date fields
  date: {
    required: true,
    custom: (value: any) => {
      if (!value) return 'Date is required';
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Please enter a valid date';
      }
      if (date > new Date()) {
        return 'Date cannot be in the future';
      }
      return null;
    }
  },
  futureDate: {
    required: false,
    custom: (value: any) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Please enter a valid date';
      }
      return null;
    }
  },
  
  // Text fields
  description: {
    required: false,
    maxLength: 1000,
    message: 'Description must be less than 1000 characters'
  },
  notes: {
    required: false,
    maxLength: 500,
    message: 'Notes must be less than 500 characters'
  },
  reference: {
    required: false,
    maxLength: 100,
    message: 'Reference must be less than 100 characters'
  },
  
  // SKU and codes
  sku: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[A-Z0-9-_]+$/,
    message: 'SKU must contain only uppercase letters, numbers, hyphens, and underscores'
  },
  
  // Account fields
  accountCode: {
    required: true,
    minLength: 1,
    maxLength: 20,
    pattern: /^[A-Z0-9-_]+$/,
    message: 'Account code must contain only uppercase letters, numbers, hyphens, and underscores'
  },
  accountName: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Account name is required and must be between 1-100 characters'
  }
};

// Validation function
export function validateField(value: any, rules: ValidationRule): string | null {
  // Check required
  if (rules.required && (!value || value.toString().trim() === '')) {
    return rules.message || 'This field is required';
  }
  
  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return null;
  }
  
  const stringValue = value.toString().trim();
  
  // Check min length
  if (rules.minLength && stringValue.length < rules.minLength) {
    return rules.message || `Must be at least ${rules.minLength} characters`;
  }
  
  // Check max length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return rules.message || `Must be less than ${rules.maxLength} characters`;
  }
  
  // Check pattern
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.message || 'Invalid format';
  }
  
  // Check custom validation
  if (rules.custom) {
    return rules.custom(value);
  }
  
  return null;
}

// Validate form data
export function validateForm(data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationErrors {
  const errors: ValidationErrors = {};
  
  for (const [field, value] of Object.entries(data)) {
    const fieldRules = rules[field];
    if (fieldRules) {
      const error = validateField(value, fieldRules);
      if (error) {
        errors[field] = error;
      }
    }
  }
  
  return errors;
}

// Validate specific field types
export const validators = {
  // Contact validation
  contact: (data: any) => validateForm(data, {
    name: VALIDATION_RULES.name,
    email: VALIDATION_RULES.email,
    phone: VALIDATION_RULES.phone,
    gstin: VALIDATION_RULES.gstin,
    pan: VALIDATION_RULES.pan,
    city: VALIDATION_RULES.city,
    state: VALIDATION_RULES.state,
  }),
  
  // Product validation
  product: (data: any) => validateForm(data, {
    sku: VALIDATION_RULES.sku,
    name: VALIDATION_RULES.name,
    description: VALIDATION_RULES.description,
    salePrice: VALIDATION_RULES.amount,
    purchasePrice: VALIDATION_RULES.amount,
    hsnCode: VALIDATION_RULES.hsnCode,
  }),
  
  // Transaction validation
  transaction: (data: any) => validateForm(data, {
    date: VALIDATION_RULES.date,
    dueDate: VALIDATION_RULES.futureDate,
    reference: VALIDATION_RULES.reference,
    notes: VALIDATION_RULES.notes,
  }),
  
  // Transaction item validation
  transactionItem: (data: any) => validateForm(data, {
    description: VALIDATION_RULES.name,
    quantity: VALIDATION_RULES.quantity,
    rate: VALIDATION_RULES.rate,
  }),
  
  // Tax validation
  tax: (data: any) => validateForm(data, {
    name: VALIDATION_RULES.name,
    rate: VALIDATION_RULES.percentage,
    description: VALIDATION_RULES.description,
  }),
  
  // Account validation
  account: (data: any) => validateForm(data, {
    code: VALIDATION_RULES.accountCode,
    name: VALIDATION_RULES.accountName,
    description: VALIDATION_RULES.description,
    openingBalance: {
      required: false,
      custom: (value: any) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = parseFloat(value);
        if (isNaN(num)) {
          return 'Opening balance must be a number';
        }
        return null;
      }
    }
  }),
  
  // User validation
  user: (data: any) => validateForm(data, {
    name: VALIDATION_RULES.name,
    email: { ...VALIDATION_RULES.email, required: true },
    phone: VALIDATION_RULES.phone,
  }),
  
  // Company validation
  company: (data: any) => validateForm(data, {
    name: VALIDATION_RULES.name,
    email: { ...VALIDATION_RULES.email, required: true },
    phone: VALIDATION_RULES.phone,
    gstin: VALIDATION_RULES.gstin,
    pan: VALIDATION_RULES.pan,
  }),
  
  // Password validation
  password: (data: any) => {
    const errors: ValidationErrors = {};
    
    if (data.newPassword) {
      const passwordError = validateField(data.newPassword, VALIDATION_RULES.strongPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      }
    }
    
    if (data.confirmPassword) {
      if (data.confirmPassword !== data.newPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  },
  
  // Simple password validation for signup
  signupPassword: (data: any) => {
    const errors: ValidationErrors = {};
    
    if (data.password) {
      const passwordError = validateField(data.password, VALIDATION_RULES.simplePassword);
      if (passwordError) {
        errors.password = passwordError;
      }
    }
    
    if (data.confirmPassword) {
      if (data.confirmPassword !== data.password) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  },
  
  // 2FA validation
  twoFA: (data: any) => validateForm(data, {
    token: {
      required: true,
      pattern: /^[0-9]{6}$/,
      message: '2FA code must be 6 digits'
    }
  })
};

// Real-time validation hook
export function useValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const validateFieldValue = (field: string, value: any, rules: ValidationRule) => {
    const error = validateField(value, rules);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
    return error;
  };
  
  const validateFormData = (data: Record<string, any>, rules: Record<string, ValidationRule>) => {
    const newErrors = validateForm(data, rules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const clearErrors = () => setErrors({});
  
  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  
  return {
    errors,
    validateField: validateFieldValue,
    validateForm: validateFormData,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
}

// Format validation errors for display
export function formatValidationErrors(errors: ValidationErrors): string[] {
  return Object.values(errors).filter(Boolean);
}

// Check if form is valid
export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}

// Get first error message
export function getFirstError(errors: ValidationErrors): string | null {
  const errorMessages = Object.values(errors).filter(Boolean);
  return errorMessages.length > 0 ? errorMessages[0] : null;
}

export default {
  VALIDATION_PATTERNS,
  VALIDATION_RULES,
  validateField,
  validateForm,
  validators,
  useValidation,
  formatValidationErrors,
  isFormValid,
  getFirstError
};
