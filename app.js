const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require('mongoose');
const contactsRouter = require("./routes/contactsRouter.js");
const router = require("./routes/authRouter.js");
require('dotenv').config(); 


const dbUrl = process.env.DB_HOST;

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Database connection successful');
});

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use('/api/users', router);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server is running. Use our API on port: ${PORT}`);
});