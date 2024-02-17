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

router.get("/", getAllContacts);
router.get("/:id", getContact);
router.delete("/:id", deleteContact);
router.post("/", createContact);
router.put("/:id", updateContactById);
router.patch("/:id/favorite", updateFavoriteStatus);


module.exports = router;