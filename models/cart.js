const Joi = require('joi');
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    products: [
    {
        productId: {
            type: String
        },
        quantity: {
            type: Number,
            default: 1
        }
    }
        ],
});

const Cart = mongoose.model('Cart', cartSchema);

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
exports.Cart = Cart;


