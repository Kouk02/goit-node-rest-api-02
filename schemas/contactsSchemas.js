const Joi = require("joi");
const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required()
});

const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string()
}).or('name', 'email', 'phone').messages({
  'object.missing': 'Body must have at least one field'
});

module.exports = {
  createContactSchema,
  updateContactSchema
};

