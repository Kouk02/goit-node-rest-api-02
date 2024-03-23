const ContactModel = require("../models/contacts.js");

async function listContacts(userId) {
  try {
    return await ContactModel.find({ owner: userId });
  } catch (error) {
    throw new Error(`Failed to list contacts: ${error.message}`);
  }
}

async function getContactById(id, ownerId) {
  try {
    const contact = await ContactModel.findById(id);
    if (!contact) {
      throw new Error("Contact not found");
    }
    if (contact.owner.toString() !== ownerId.toString()) {
      throw new Error("Access denied");
    }
    return contact;
  } catch (error) {
    throw new Error(`Failed to get contact by id: ${error.message}`);
  }
}

async function removeContact(id, ownerId) {
  try {
    const contact = await ContactModel.findById(id);
    if (!contact) {
      throw new Error("Contact not found");
    }
    if (contact.owner.toString() !== ownerId.toString()) {
      throw new Error("Access denied");
    }
    return await ContactModel.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Failed to remove contact: ${error.message}`);
  }
}

async function addContact(name, email, phone, ownerId) {
  try {
    return await ContactModel.create({ name, email, phone, owner: ownerId });
  } catch (error) {
    throw new Error(`Failed to add contact: ${error.message}`);
  }
}

async function updateContact(id, newData, ownerId) {
  try {
    const contact = await ContactModel.findById(id);
    if (!contact) {
      throw new Error("Contact not found");
    }
    if (contact.owner.toString() !== ownerId.toString()) {
      throw new Error("Access denied");
    }
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