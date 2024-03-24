const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  service: 'meta', // або інший провайдер, який ви використовуєте
  auth: {
    user: 'kouk2002@meta.ua', // ваша електронна адреса
    pass: 'R3Bp5V95mz' // ваш пароль (краще використовувати додаткові пароль або токен для безпеки)
  }
});

module.exports = transport;