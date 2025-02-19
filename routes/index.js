const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home_controller');

console.log('🟢 Router loaded'); // Debug log

router.get('/', homeController.home); // ✅ Ensure this correctly calls the controller

router.use('/users', require('./users')); // ✅ Ensure this handles user routes


module.exports = router;



