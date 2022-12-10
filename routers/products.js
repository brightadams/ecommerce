const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Product, validate} = require('../models/product');
const mongoose = require('mongoose');
const express = require('express');
const validateObjectId = require('../middleware/validateObjectId');
const router = express.Router();

router.get('/', async (req, res) => {
  const products = await Product.find().sort('name');
  res.send(products);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let product = new Product({ 
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    categoryId: req.body.categoryId
 });
   product = await product.save();
  
  res.send(product);
});

// router.put('/:id',[auth, admin], async (req, res) => {
//   const { error } = validate(req.body); 
//   if (error) return res.status(400).send(error.details[0].message);

//   const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
//     new: true
//   });

//   if (!category) return res.status(404).send('The category with the given ID was not found.');
  
//   res.send(category);
// });

router.delete('/:id',[auth,admin], async (req, res) => {
  const product = await Product.findByIdAndRemove(req.params.id);

  if (!product) return res.status(404).send('The product with the given ID was not found.');

  res.send(product);
});

router.get('/:id',validateObjectId, async (req, res) => {
  
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).send('The product with the given ID was not found.');

  res.send(product);
});

module.exports = router;