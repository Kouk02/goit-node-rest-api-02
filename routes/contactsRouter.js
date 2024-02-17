import express from "express";
import { getAllContacts, deleteContact, createContact, getContact, updateContactById } from "../controllers/contactsControllers.js";

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);
contactsRouter.get("/:id", getContact); 
contactsRouter.delete("/:id", deleteContact);
contactsRouter.post("/", createContact);
contactsRouter.put("/:id", updateContactById); 

export default contactsRouter;
