const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
  host: 'smtp.meta.ua',
port: 465,
secure: true,
  auth: {
    user: 'metasrvc@meta.ua',
    pass: process.env.API_KEY 
  }
});

module.exports = transport;