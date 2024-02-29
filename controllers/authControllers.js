const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Joi = require('joi');

const JWT_SECRET = process.env.TOKEN_SECRET || 'default_secret_key';

exports.registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      subscription: "starter"
    });

    const savedUser = await newUser.save();

    const payload = {
      sub: savedUser._id,
      email: savedUser.email,
      subscription: savedUser.subscription
    };
    const token = jwt.sign(payload, JWT_SECRET);

    savedUser.token = token;
    await savedUser.save();

    res.status(201).json({ 
      user: { 
        email: savedUser.email, 
        subscription: savedUser.subscription
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const payload = {
      sub: user._id,
      email: user.email,
      subscription: user.subscription
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    const responseData = {
      token,
      user: {
        email: user.email,
        subscription: user.subscription
      }
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({ 
      email: user.email, 
      subscription: user.subscription 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};