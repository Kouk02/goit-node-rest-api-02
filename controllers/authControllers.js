// authControllers.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Joi = require('joi');

//! Регістрація користувача
exports.registerUser = async (req, res) => {



  // Валідація даних користувача
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

    
    
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

    
    
    
  // Перевірка наявності користувача з такою ж поштою
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(409).json({ message: "Email in use" });
  }

    
    
    
  // Засолювання паролю та створення користувача
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

    
    
  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });

    
    
  try {
    const savedUser = await user.save();
    res.status(201).json({ user: { email: savedUser.email, subscription: savedUser.subscription } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Логін користувача
exports.loginUser = async (req, res) => {
  // Валідація даних для логіну
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

    
    
    
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

    
    
    
  // Пошук користувача за електронною адресою
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

    
    
  // Перевірка паролю
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

    
    
    
  // Створення токену
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  user.token = token;
  await user.save();

  res.status(200).json({ token, user: { email: user.email, subscription: user.subscription } });
};





// Вихід користувача (logout)
exports.logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Видалення токену у користувача
    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// Отримання даних поточного користувача за токеном
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({ email: user.email, subscription: user.subscription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};