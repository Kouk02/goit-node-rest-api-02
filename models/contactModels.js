const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
  },
  email: String,
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;