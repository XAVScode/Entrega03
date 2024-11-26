const mongoose = require("mongoose");

// Esquema de Producto
const productSchema = mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageURL: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }]
});



module.exports = mongoose.model('Product', productSchema);