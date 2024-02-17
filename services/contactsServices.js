const ContactModel = require("./contacts.js");

async function listContacts() {
  return await ContactModel.find();
}

async function getContactById(contactId) {
  return await ContactModel.findById(contactId);
}

async function removeContact(contactId) {
  return await ContactModel.findByIdAndRemove(contactId);
}

async function addContact(name, email, phone) {
  return await ContactModel.create({ name, email, phone });
}

async function updateContact(contactId, newData) {
  return await ContactModel.findByIdAndUpdate(contactId, newData, { new: true });
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact
};

