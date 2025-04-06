import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import User from "../models/usermodel.js";

const router=express.Router();


// Signup route
router.post('/signup', async (req, res) => {
    try {
      console.log(req.body);
      const { username, email, profilePicture, bio, password } = req.body;
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
      const newUser = new User({
        username,
        email,
        profilePicture: profilePicture || "",
        bio: bio || "",
        likedModels: [],
        savedModels: [],
        subscribed: false
      });
      // This handles the password hashing and salt creation
      const registeredUser = await User.register(newUser, password);
      
      // Auto-login after signup
      req.login(registeredUser, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error during login after signup' });
        }
        return res.status(201).json({ 
          success: true, 
          message: 'User registered successfully',
          user: {
            id: registeredUser._id,
            username: registeredUser.username,
            email: registeredUser.email,
            profilePicture: registeredUser.profilePicture,
            bio: registeredUser.bio,
            subscribed: registeredUser.subscribed
          }
        });
      });
    } catch (error) {
      // Handle passport-local-mongoose specific errors
      if (error.name === 'UserExistsError') {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already exists'
        });
      }
      res.status(500).json({ 
        success: false, 
        message: 'Error creating user',
        error: error.message 
      });
    }
  });
  
  // Login route
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error during authentication' });
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info.message || 'Authentication failed' 
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error during login' });
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Login successful',
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            subscribed: user.subscribed
          }
        });
      });
    })(req, res, next);
  });
  
  // Logout route
  router.post('/logout', (req, res) => {
    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error during logout' });
      }
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
  });
  
  // Get current user route
  router.get('/current-user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profilePicture: req.user.profilePicture,
        bio: req.user.bio,
        likedModels: req.user.likedModels,
        savedModels: req.user.savedModels,
        subscribed: req.user.subscribed
      }
    });
  });



export default router;