const ContactModel = require("./contacts.js");

async function listContacts() {
  try {
    return await ContactModel.find();
  } catch (error) {
    throw new Error(`Failed to list contacts: ${error.message}`);
  }
}

async function getContactById(id) {
  try {
    return await ContactModel.findById(id);
  } catch (error) {
    throw new Error(`Failed to get contact by id: ${error.message}`);
  }
}

async function removeContact(id) {
  try {
    return await ContactModel.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to remove contact: ${error.message}`);
  }
}

async function addContact(name, email, phone) {
  try {
    return await ContactModel.create({ name, email, phone });
  } catch (error) {
    throw new Error(`Failed to add contact: ${error.message}`);
  }
}

async function updateContact(id, newData) {
  try {
    return await ContactModel.findByIdAndUpdate(id, newData, { new: true });
  } catch (error) {
    throw new Error(`Failed to update contact: ${error.message}`);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact
};