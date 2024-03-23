const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  id: mongoose.Schema.Types.ObjectId,
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
    default: null,
  },
      avatarURL: {
      type: String,
      default: "/avatars/avatar.jpg",
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;