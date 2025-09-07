import Joi from 'joi';

/**
 * Validation schemas for request data
 */

// User registration schema
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    })
});

// User login schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Add project schema
export const addProjectSchema = Joi.object({
  repositoryPath: Joi.string()
    .pattern(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Repository path must be in format: owner/repository',
      'any.required': 'Repository path is required'
    })
});

// Update project schema
export const updateProjectSchema = Joi.object({
  stars: Joi.number()
    .integer()
    .min(0)
    .optional(),
  forks: Joi.number()
    .integer()
    .min(0)
    .optional(),
  open_issues: Joi.number()
    .integer()
    .min(0)
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Project ID parameter schema
export const projectIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Project ID must be a number',
      'number.integer': 'Project ID must be an integer',
      'number.positive': 'Project ID must be positive',
      'any.required': 'Project ID is required'
    })
});

/**
 * Validation middleware factory
 * @param schema - Joi schema to validate against
 * @param property - Request property to validate (body, params, query)
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace the original property with the validated and sanitized value
    req[property] = value;
    next();
  };
};
