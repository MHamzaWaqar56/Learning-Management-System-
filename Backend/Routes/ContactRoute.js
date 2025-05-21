const express = require('express');
const { isAuthenticated } = require('../Middlewares/auth');
const { Contact } = require('../Controllers/ContactController');
const router = express.Router();



router.post('/email', isAuthenticated, Contact);

module.exports = router;