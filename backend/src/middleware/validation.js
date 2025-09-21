import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    console.log("Request body:", req.body);
    return res.status(400).json({
      error: "Validation failed",
      message: "Please check your input and try again",
      details: errors.array(),
    });
  }
  next();
};

// Auth validation rules
export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
  handleValidationErrors,
];

export const validateRegister = [
  body("companyName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Company name is required"),
  body("companyEmail")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid company email is required"),
  body("adminName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Admin name is required"),
  body("adminEmail")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid admin email is required"),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
  body("phone")
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number should be 10-15 digits"),
  body("gstin")
    .optional()
    .isLength({ max: 15 })
    .withMessage("GSTIN should be 15 characters or less"),
  body("pan")
    .optional()
    .isLength({ max: 10 })
    .withMessage("PAN should be 10 characters or less"),
  handleValidationErrors,
];

// Contact validation rules
export const validateContact = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Contact name is required"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),
  body("phone")
    .optional()
    .matches(/^(\+91[-\s]?)?[6-9]\d{9}$/)
    .withMessage(
      "Valid Indian phone number required (10 digits starting with 6-9, or +91 followed by 10 digits)"
    ),
  body("gstin")
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage("Valid GSTIN required"),
  body("pan")
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Valid PAN required"),
  body("isCustomer")
    .optional()
    .isBoolean()
    .withMessage("isCustomer must be boolean"),
  body("isVendor")
    .optional()
    .isBoolean()
    .withMessage("isVendor must be boolean"),
  handleValidationErrors,
];

// Product validation rules
export const validateProduct = [
  body("sku").trim().isLength({ min: 1 }).withMessage("SKU is required"),
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product name is required"),
  body("salePrice")
    .isFloat({ min: 0 })
    .withMessage("Sale price must be a positive number"),
  body("purchasePrice")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),
  body("unit")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Unit is required"),
  body("hsnCode")
    .optional()
    .matches(/^[0-9]{4,8}$/)
    .withMessage("Valid HSN code required"),
  body("isService")
    .optional()
    .isBoolean()
    .withMessage("isService must be boolean"),
  handleValidationErrors,
];

// Transaction validation rules
export const validateTransaction = [
  body("type")
    .isIn([
      "SALES_ORDER",
      "PURCHASE_ORDER",
      "INVOICE",
      "BILL",
      "PAYMENT",
      "RECEIPT",
      "JOURNAL",
    ])
    .withMessage("Valid transaction type required"),
  body("contactId")
    .optional()
    .isUUID()
    .withMessage("Valid contact ID required"),
  body("date").optional().isISO8601().withMessage("Valid date required"),
  body("dueDate").optional().isISO8601().withMessage("Valid due date required"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("items.*.description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Item description is required"),
  body("items.*.quantity")
    .isFloat({ min: 0.001 })
    .withMessage("Item quantity must be positive"),
  body("items.*.rate")
    .isFloat({ min: 0 })
    .withMessage("Item rate must be positive"),
  handleValidationErrors,
];

// Tax validation rules
export const validateTax = [
  body("name").trim().isLength({ min: 1 }).withMessage("Tax name is required"),
  body("type")
    .isIn(["GST", "CGST", "SGST", "IGST", "VAT", "TDS", "OTHER"])
    .withMessage("Valid tax type required"),
  body("rate")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Tax rate must be between 0 and 100"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description too long"),
  body("isCompound")
    .optional()
    .isBoolean()
    .withMessage("isCompound must be boolean"),
  handleValidationErrors,
];

// Account validation rules
export const validateAccount = [
  body("code")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Account code is required"),
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Account name is required"),
  body("type")
    .isIn([
      "ASSET",
      "LIABILITY",
      "EQUITY",
      "REVENUE",
      "EXPENSE",
      "CONTRA_ASSET",
      "CONTRA_LIABILITY",
    ])
    .withMessage("Valid account type required"),
  body("parentId")
    .optional()
    .isUUID()
    .withMessage("Valid parent account ID required"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description too long"),
  body("openingBalance")
    .optional()
    .isFloat()
    .withMessage("Opening balance must be a number"),
  handleValidationErrors,
];
