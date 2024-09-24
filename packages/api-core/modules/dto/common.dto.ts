import * as Joi from 'joi';

export const passwordSchema = Joi.string()
  .trim()
  .min(8)
  .max(32)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
  .messages({
    'string.pattern.base': 'Invalid password',
  });
