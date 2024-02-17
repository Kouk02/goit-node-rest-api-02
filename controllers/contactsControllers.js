import { listContacts, getContactById, removeContact, addContact, updateContact } from "../services/contactsServices.js";
import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";


async function getAllContacts(req, res, next) {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getContact(req, res, next) {
  const { id } = req.params;
  try {
    const contact = await getContactById(id);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteContact(req, res, next) {
  const { id } = req.params;
  try {
    const deletedContact = await removeContact(id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(deletedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createContact(req, res, next) {
  try {
    const { error } = createContactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const { name, email, phone } = req.body;
    const newContact = await addContact(name, email, phone);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function updateContactById(req, res, next) {
  const { id } = req.params; 
  const { name, email, phone } = req.body;

  try {
    if (!name && !email && !phone) {
      return res.status(400).json({ message: "At least one field (name, email, phone) must be provided for update" });
    }

    const existingContact = await getContactById(id); 
    if (!existingContact) {
      return res.status(404).json({ message: "Contact not found" });
    }


    const phoneRegex = /^\+?\d+$/;
    if (phone !== undefined && !phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone must contain only digits and optional '+' symbol" });
    }

    const updatedFields = {};

    if (name !== undefined) {
      updatedFields.name = name;
    }
    if (email !== undefined) {
      updatedFields.email = email;
    }
    if (phone !== undefined) {
      updatedFields.phone = phone;
    }

    const updatedContact = await updateContact(id, updatedFields); 

    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}




export { getAllContacts, getContact, deleteContact, createContact, updateContactById };
