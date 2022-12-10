const Joi = require('joi');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  }
});

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    categoryId: Joi.string().required(),
  };

  return Joi.validate(product, schema);
}

//exports.categorySchema = categorySchema;
exports.Product = Product; 
exports.validate = validateProduct;