const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const contactSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const Contacts = mongoose.model('Contacts', contactSchema);

module.exports = {
  Contacts,
  registerSchema,
  loginSchema
};
