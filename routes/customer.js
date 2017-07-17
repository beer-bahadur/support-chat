var express = require('express');
const customerController = require('../controllers/customer');

const customerRoutes = express.Router();

// customerRoutes.get('/', authController.userAuthenticated, chatController.getConversations);
customerRoutes.post('/', customerController.createCustomerAndStartConversation);

module.exports = customerRoutes;