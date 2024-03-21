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
const { verifyToken } = require('../middlewares/authMiddleware'); 

router.get("/", verifyToken, getAllContacts); 
router.get("/:id", verifyToken, isValidId, getContact); 
router.delete("/:id", verifyToken, isValidId, deleteContact); 
router.post("/", verifyToken, createContact); 
router.put("/:id", verifyToken, isValidId, updateContactById); 
router.patch("/:id/favorite", verifyToken, isValidId, updateFavoriteStatus); 

module.exports = router;