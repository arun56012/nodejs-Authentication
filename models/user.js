
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            unique: true,
            sparse: true // Allows users to exist without Google ID
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
        },
        password: {
            type: String,
            required: false,
            minlength: 6
        },
        avatar: {
            type: String
        }
    },
    { timestamps: true }
);

// Hash password only if it's modified
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Email already exists!'));
    } else {
        next(error);
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;

