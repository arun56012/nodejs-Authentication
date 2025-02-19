// const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');  // Required for handling sessions

module.exports.profile = function (req, res) {
    res.setHeader("Cache-Control", "no-store");
    return res.render('user_profile', {
        title: "User Profile"
    });
};

module.exports.SignUp = function (req, res) {
    return res.render('user_sign_up', {
        title: "Codeial | Sign Up",
        name: req.body.name || '',
        email: req.body.email || '',
        error: req.query.error || ''  // You can pass error messages if needed
    });
};





module.exports.handleSignUp = async function (req, res) {
    try {
        const { name, email, password, confirm_password } = req.body;

        // Basic validation
        if (!name || !email || !password || !confirm_password) {
            req.flash('error_msg', '❌ All fields are required.');
            return res.status(400).send('❌ All fields are required');
            // return res.redirect('/users/sign-up');
        }

        if (password !== confirm_password) {
            req.flash('error_msg', '❌ password not match.');
            // return res.status(400).send('❌ Passwords do not match');
            return res.redirect('/users/sign-up');
        }

        // Check if user already exists before creating a new user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('❌ Email already in use');
        }

        // Create and save the new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        console.log('✅ User registered successfully!');
        return res.redirect('sign-in');
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send('❌ Email already exists!');
        }
        console.error('❌ Error during sign-up:', error.message);
        return res.status(500).send('❌ Server error');
    }
};



module.exports.SignIn = function (req, res) {
    return res.render('user_sign_in', {   
        title: "Codeial | Sign In",
        email: req.body.email || '',
        password: req.body.password || '',

    });
};


module.exports.handleSignIn = async function (req, res) {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).send('❌ All fields are required');
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(400).send('❌ Invalid credentials: user not found');
            

        }

        // Compare password using model's method
        const match = await user.comparePassword(password);
        if (!match) {
            console.log('❌ Password mismatch for user:', email);
            req.flash('error_msg', '❌ incorrect password.');
            return res.redirect('/users/sign-in');
            // return res.status(400).send('❌ Invalid credentials');
        }

        // Set up session (or use JWT if needed)
        req.session.user = user;
        console.log("✅ Session set for user:", req.session.user);
        console.log('✅ User signed in successfully!');

        return res.redirect('/users/profile');
    } catch (error) {
        console.error('❌ Error during sign-in:', error.message);
        return res.status(500).send('❌ Server error');
    }
};



module.exports.logout = (req, res) => {
    if (!req.session) {
        console.log("⚠️ No session found to destroy.");
        return res.redirect('/users/sign-in');
    }

    const sessionId = req.session.id; // Get current session ID

    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Logout Error:', err);
            return res.status(500).send('❌ Server error');
        }

        console.log(`✅ Session destroyed. ID: ${sessionId}`);
        res.redirect('/users/sign-in');
    });
};




module.exports.changePasswordForm = (req, res) => {
    return res.render('change_password', {
        title: "Change Password"
    });
};



module.exports.changePassword = async function(req, res) {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Check if user is logged in
        if (!req.session || !req.session.user) {
            return res.status(401).send('❌ Unauthorized: Please log in first');
        }

        // Ensure all fields are provided
        if (!oldPassword || !newPassword || !confirmPassword) {
            console.log('Form data:', req.body);
            return res.status(400).send('❌ All fields are required');
        }

        // Ensure new password matches confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).send('❌ Passwords do not match');
        }


        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(404).send('❌ User not found');
        }

        // Check if the old password matches the stored password
        if (!user.password) {
            return res.status(400).send('❌ No password found for user');
        }
        
        // const isMatch = await bcrypt.compare(oldPassword, user.password);
        const isMatch = await user.comparePassword(oldPassword);
        
        if (!isMatch) {
            return res.status(400).send('❌ Old password is incorrect');
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update and save the user
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).send('✅ Password updated successfully!');
    } catch (error) {
        console.error('❌ Error changing password:', error);
        return res.status(500).send('❌ Server error');
    }
};
