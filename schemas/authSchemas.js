const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});

const Contacts = mongoose.model('Contacts', contactSchema);

module.exports = Contacts;