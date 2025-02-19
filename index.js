const express = require("express");
const app = express();
const PORT = 8000;
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/mongoose');  // Import the connectDB function
// const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('./models/user'); // Make sure this is the correct path
const flash = require('connect-flash');

require('dotenv').config();
// app.use(bodyParser.urlencoded({ extended: true }));  // Middleware to parse form data

// Middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));


app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"
  },
  
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 🔍 Find a user by email first
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // ✅ If user exists but has no Google ID, link it
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        console.log("🟢 Existing user logged in:", user.email);
      } else {
        // 🔥 If user doesn't exist, create a new one
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        });
        await user.save();
        console.log("✅ New user created:", user.email);
      }

      return done(null, user);
    } catch (err) {
      console.error("❌ Google Auth Error:", err);
      return done(err, null);
    }
  }
));



    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    //  // Middleware to protect routes
        function isAuthenticated(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }
            res.redirect('/');
        }


        
    

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get("/auth/google/callback",
    passport.authenticate('google', { failureRedirect: "/" }),
    (req, res) => {
        res.redirect('/users/profile');
    }
);




app.get("/profile", isAuthenticated, (req, res) => {
    res.render("user_profile", { 
        title: "User Profile",
        user: req.user 
    });
});



app.get("/logout",isAuthenticated,(req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.session.destroy(() => {
            res.redirect("/");
        });
    });
});



app.use(flash());

// Middleware to pass flash messages to views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});





 // Static files setup   

app.use(express.static('./assets'));

app.use(expressLayouts);

app.set('layout extractstyle', true);
app.set('layout extractscripts', true);


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));


// // Static files (like CSS, JS) setup
//  app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/index'));


// Connect to MongoDB
connectDB();






// Start Server
app.listen(PORT, function(err) {
    if(err){
        console.log(`error in running the server:${err}`);
    }
  console.log(`Server is running on http://localhost:${PORT}`);
});




