const express = require("express");
const router = express.Router();
const {
  getAllContacts,
  deleteContact,
  createContact,
  getContact,
  updateContactById,
  updateFavoriteStatus
} = require("../controllers/contactsControllers.js");
const isValidId = require("../isValidId.js"); 

router.get("/", getAllContacts);
router.get("/:id", isValidId, getContact); 
router.delete("/:id", isValidId, deleteContact); 
router.post("/", createContact);
router.put("/:id", isValidId, updateContactById); 
router.patch("/:id/favorite", isValidId, updateFavoriteStatus); 

module.exports = router;
