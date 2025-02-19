
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users_controller');

console.log('✅ Users router loaded');

// Profile Route
router.get('/profile', usersController.profile);

// Sign-up Routes
router.get('/sign-up', usersController.SignUp);  // Show the signup form
router.post('/handleSignUp', usersController.handleSignUp); // Handle form submission

// // Sign-in Route
router.get('/sign-in', usersController.SignIn);
router.post('/handleSignIn', usersController.handleSignIn); // Handle form submission

router.post('/logout', usersController.logout);

// Render Change Password Form
router.get('/change-password', usersController.changePasswordForm);

// Handle Change Password Submission
router.post('/change-password', usersController.changePassword);



module.exports = router;

