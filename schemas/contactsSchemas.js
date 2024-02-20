const Joi = require("joi");

const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?\d+$/).required()
}).messages({
  'string.pattern.base': 'Phone must contain only digits and optional "+" symbol'
});

const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\+?\d+$/)
}).or('name', 'email', 'phone').messages({
  'object.missing': 'Body must have at least one field',
  'string.pattern.base': 'Phone must contain only digits and optional "+" symbol'
});

const patchContactSchema = Joi.object({
  favorite: Joi.boolean().required(),
  name: Joi.string().when('favorite', { is: true, then: Joi.required() }),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\+?\d+$/)
}).messages({
  'any.required': 'Favorite field is required',
  'string.pattern.base': 'Phone must contain only digits and optional "+" symbol'
});

module.exports = {
  createContactSchema,
  updateContactSchema,
  patchContactSchema
};