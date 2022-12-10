const express = require('express');
const users = require('../routers/users');
const auth = require('../routers/auth');
const categories = require('../routers/categories');
const products = require('../routers/products');
const error = require('../middleware/error');

module.exports = function(app) {
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/categories', categories);
  app.use('/api/auth', auth);
  app.use('/api/products', products);
  app.use(error);
}