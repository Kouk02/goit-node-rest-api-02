const { listContacts, getContactById, removeContact, addContact, updateContact } = require("../services/contactsServices.js");
const { createContactSchema, updateContactSchema, patchContactSchema } = require("../schemas/contactsSchemas.js");
const validateBody = require("../helpers/validateBody");

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
  const { error: validationError } = updateContactSchema.validate(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError.message });
  }
  try {
    const { name, email, phone } = req.body;
    
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

    const updatedContact = await updateContact(id, req.body); 

    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function updateFavoriteStatus(req, res, next) {
  const { id } = req.params;

  try {
    const existingContact = await getContactById(id);
    if (!existingContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
   
   
    if ('favorite' in req.body) {
      const { error } = patchContactSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
    }


    let updatedFavorite = existingContact.favorite;


    if ('favorite' in req.body) {
      updatedFavorite = req.body.favorite;
    } else {
    
      updatedFavorite = !updatedFavorite;
    }

    const updatedContact = await updateContact(id, {
      favorite: updatedFavorite
    });

    res.status(200).json(updatedContact);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
  getAllContacts,
  getContact,
  deleteContact,
  createContact,
  updateContactById,
  updateFavoriteStatus
};
