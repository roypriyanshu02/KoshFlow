import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KoshFlow API',
      version: '1.0.0',
      description: 'Smart Indian Accounting Platform API Documentation',
      contact: {
        name: 'KoshFlow Support',
        email: 'support@koshflow.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: 'https://api.koshflow.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for external integrations'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'ACCOUNTANT', 'VIEWER', 'CUSTOMER', 'VENDOR'],
              description: 'User role'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether user account is active'
            },
            isTwoFactorEnabled: {
              type: 'boolean',
              description: 'Whether 2FA is enabled'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Company: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique company identifier'
            },
            name: {
              type: 'string',
              description: 'Company name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Company email address'
            },
            phone: {
              type: 'string',
              description: 'Company phone number'
            },
            gstin: {
              type: 'string',
              description: 'GSTIN number'
            },
            pan: {
              type: 'string',
              description: 'PAN number'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Company creation timestamp'
            }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique contact identifier'
            },
            name: {
              type: 'string',
              description: 'Contact name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email address'
            },
            phone: {
              type: 'string',
              description: 'Contact phone number'
            },
            gstin: {
              type: 'string',
              description: 'GSTIN number'
            },
            pan: {
              type: 'string',
              description: 'PAN number'
            },
            isCustomer: {
              type: 'boolean',
              description: 'Whether contact is a customer'
            },
            isVendor: {
              type: 'boolean',
              description: 'Whether contact is a vendor'
            },
            creditLimit: {
              type: 'number',
              format: 'decimal',
              description: 'Credit limit amount'
            },
            paymentTerms: {
              type: 'integer',
              description: 'Payment terms in days'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique product identifier'
            },
            sku: {
              type: 'string',
              description: 'Product SKU'
            },
            name: {
              type: 'string',
              description: 'Product name'
            },
            description: {
              type: 'string',
              description: 'Product description'
            },
            salePrice: {
              type: 'number',
              format: 'decimal',
              description: 'Sale price'
            },
            purchasePrice: {
              type: 'number',
              format: 'decimal',
              description: 'Purchase price'
            },
            unit: {
              type: 'string',
              description: 'Product unit'
            },
            hsnCode: {
              type: 'string',
              description: 'HSN code'
            },
            isService: {
              type: 'boolean',
              description: 'Whether product is a service'
            },
            trackInventory: {
              type: 'boolean',
              description: 'Whether to track inventory'
            },
            currentStock: {
              type: 'number',
              format: 'decimal',
              description: 'Current stock quantity'
            },
            minStockLevel: {
              type: 'number',
              format: 'decimal',
              description: 'Minimum stock level'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique transaction identifier'
            },
            type: {
              type: 'string',
              enum: ['SALES_ORDER', 'PURCHASE_ORDER', 'INVOICE', 'BILL', 'PAYMENT', 'RECEIPT', 'JOURNAL'],
              description: 'Transaction type'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'CHANGES_REQUESTED', 'REJECTED', 'ACCEPTED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'OVERDUE'],
              description: 'Transaction status'
            },
            contactId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated contact ID'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Transaction date'
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Due date'
            },
            reference: {
              type: 'string',
              description: 'Transaction reference'
            },
            notes: {
              type: 'string',
              description: 'Transaction notes'
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
              description: 'Subtotal amount'
            },
            taxAmount: {
              type: 'number',
              format: 'decimal',
              description: 'Total tax amount'
            },
            total: {
              type: 'number',
              format: 'decimal',
              description: 'Total amount'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type'
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field name'
                  },
                  message: {
                    type: 'string',
                    description: 'Field error message'
                  }
                }
              },
              description: 'Validation error details'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Unauthorized',
                message: 'Access token required',
                code: 'NO_TOKEN'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Forbidden',
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Validation failed',
                message: 'Please check your input and try again',
                details: [
                  {
                    field: 'email',
                    message: 'Valid email is required'
                  }
                ]
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Not found',
                message: 'The requested resource does not exist',
                code: 'RESOURCE_NOT_FOUND'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Too many requests',
                message: 'Too many requests from this IP, please try again later',
                retryAfter: 900
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Company',
        description: 'Company management'
      },
      {
        name: 'Contacts',
        description: 'Customer and vendor management'
      },
      {
        name: 'Products',
        description: 'Product and service management'
      },
      {
        name: 'Transactions',
        description: 'Transaction management'
      },
      {
        name: 'Accounts',
        description: 'Chart of accounts management'
      },
      {
        name: 'Taxes',
        description: 'Tax configuration management'
      },
      {
        name: 'Reports',
        description: 'Financial reports and analytics'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/middleware/*.js'
  ]
};

const specs = swaggerJsdoc(options);

// Custom CSS for Swagger UI
const customCss = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info .title { color: #2563eb; }
  .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
`;

const swaggerOptions = {
  customCss,
  customSiteTitle: 'KoshFlow API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

export { specs, swaggerOptions };
export default swaggerUi;
