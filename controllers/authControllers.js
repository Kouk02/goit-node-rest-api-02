const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Joi = require('joi');
const { Contacts } = require('../schemas/authSchemas');
const gravatar = require('gravatar');
const Jimp = require("jimp");
const path = require("path");
const fs = require('fs');
const { httpError } = require('../helpers/httpError');
const transport = require('../helpers/email');
const { v4: uuidv4 } = require('uuid');




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
    const verificationToken = uuidv4(); 
    const verifyEmailLink = `${req.protocol}://${req.get('host')}/auth/verify/${verificationToken}`;
    const newUser = new User({
      email,
      password: hashedPassword,
      subscription: "starter",
      avatarURL: avatarUrl,
      verificationToken 
    });
    await newUser.save();

    const mailOptions = {
      from: 'metasrvc@meta.ua',
      to: newUser.email,
      subject: 'Verify your email address',
      html: `<p>Please click the following link to verify your email address:</p>
             <a href="${verifyEmailLink}">${verifyEmailLink}</a>`,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    const payload = {
      sub: newUser._id,
      email: newUser.email,
      subscription: newUser.subscription
    };
    const token = jwt.sign(payload, JWT_SECRET);
    newUser.token = token;
    await newUser.save();

    const newContact = new Contacts({ owner: newUser._id });
    await newContact.save();

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription
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
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const payload = {
      sub: user._id,
      email: user.email,
      subscription: user.subscription
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    
    await User.findByIdAndUpdate(user._id, { token });

    const responseData = {
      token,
      user: {
        email: user.email,
        subscription: user.subscription
      }
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.log(err.message);
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

    await User.findByIdAndUpdate(
      userId,
      { avatarURL },
      { new: true }
    );

  
    res.json({ avatarURL });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Error updating avatar. Please try again' });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      // Якщо користувач не знайдений, повертаємо 404
      return res.status(404).json({ message: 'User not found' });
    }

    // Позначаємо користувача як підтвердженого і зберігаємо зміни в базі даних
    await User.findByIdAndUpdate(user._id, {
      verificationToken: "",
      isVerified: true,
    })

    // Відправляємо відповідь про успішну верифікацію
    return res.json({ message: 'Verification successful' }); // Вказуємо, куди відправляти відповідь
  } catch (error) {
    // Обробка помилки
    console.error('Error verifying email:', error);
    return res.status(500).json({ message: 'Error verifying email. Please try again' }); // Вказуємо, куди відправляти відповідь
  }
};
 
exports.resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(httpError(404, 'User not found'));
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'Verification has already been passed' });
  }

  const verifyEmailLink = `${req.protocol}://${req.get('host')}/auth/verify/${user.verificationToken}`;

  const mailOptions = {
    from: 'kouk2002@meta.ua',
    to: user.email,
    subject: 'Verify your email address',
    html: `<p>Please click the following link to verify your email address:</p>
         <a href="${verifyEmailLink}">${verifyEmailLink}</a>`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return next(httpError(500, 'Failed to send verification email'));
    } else {
      console.log('Email sent: ' + info.response);
      res.json({ message: 'Verification email sent' });
    }
  });
}