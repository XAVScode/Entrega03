const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Elimina espacios innecesarios
  },
  password: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('User', userSchema);
