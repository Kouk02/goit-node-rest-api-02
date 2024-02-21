const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;