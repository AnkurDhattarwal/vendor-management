// backend/models/User.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: [ true, 'Email is required' ],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [ true, 'Password is required' ],
    minlength: [ 6, 'Password must be at least 6 characters' ]
  },
  role: {
    type: String,
    enum: [ 'admin', 'supervendor', 'subvendor', 'driver' ],
    default: null
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = model('User', userSchema);
