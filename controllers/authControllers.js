const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Joi = require('joi');
const { Contacts } = require('../schemas/authSchemas');
const gravatar = require('gravatar');
const Jimp = require("jimp");
const path = require("path");
const fs = require('fs');

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
    const avatarUrl = gravatar.url(email, { s: '200', r: 'pg', d: 'retro' });
    const newUser = new User({
      email,
      password: hashedPassword,
      subscription: "starter",
      avatarURL: avatarUrl
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
    const newContact = new Contacts({ owner: savedUser._id });
    await newContact.save();
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
    const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !passwordMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const payload = {
      sub: user._id,
      email: user.email,
      subscription: user.subscription
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
 
    user.token = token;
    await user.save();

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

exports.logoutUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      email: user.email,
      subscription: user.subscription
    });
  } catch (err) {
    next(err);
  }
};


exports.updateUserAvatar = async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.sub;

    const avatarFile = req.file;

    if (!avatarFile) {
      return res.status(400).json({ message: 'No avatar file provided' });
    }

    const tmpDir = path.join(__dirname, '../tmp');
    const avatarFileName = `${userId}_photo.jpg`;
    const avatarsDir = path.join(__dirname, '../public/avatars');
    const avatarURL = `/avatars/${avatarFileName}`;

    const avatar = await Jimp.read(avatarFile.path);
    await avatar.resize(250, 250);
    await avatar.writeAsync(avatarFile.path);

    const newAvatarPath = path.join(avatarsDir, avatarFileName);
    fs.renameSync(avatarFile.path, newAvatarPath);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarURL },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Користувач не знайдений' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Помилка оновлення аватарки:', error);
    res.status(500).json({ message: 'Помилка оновлення аватарки. Будь ласка, спробуйте ще раз' });
  }
};
