// routes/userRouter.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../config/database');
const {Jwt_secret}=require("../secret.js");
const router = express.Router();
const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, Jwt_secret, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };
// user Registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, bio } = req.body;
    // Hash the password using bcrypt.hashSync()
    const hashedPassword = bcrypt.hashSync(password, 10);
    // Insert user data into the database
    const createUserQuery = `
      INSERT INTO users (username, password, name, bio) 
      VALUES (?, ?, ?, ?)
    `;
    await connection.query(createUserQuery, [username, hashedPassword, name, bio]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login Endpoint
router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // Query the database for the user
    connection.query('SELECT * FROM users WHERE username =?', [username], (error, results, fields) => {
      if (error) {
        res.status(500).send('Error connecting to the database');
        return;
      }
  
      // Check if the user exists
      if (results.length === 0) {
        res.status(401).send('Invalid username or password');
        return;
      }
  
      // Check the password
      const user = results[0];
      bcrypt.compare(password, user.password, (error, result) => {
        if (error) {
          res.status(500).send('Error comparing the password');
          return;
        }
  
        if (result) {
          // Generate the JWT token
          const token = jwt.sign({ username: user.username }, Jwt_secret);
  
          // Return the token
          res.status(200).send({ token });
        } else {
          res.status(401).send('Invalid username or password');
        }
      });
    });
  });
  // Protected Endpoint (user list)
router.get('/users', authenticateUser, async (req, res) => {
    try {
      const users = await connection.query('SELECT id, username, name, bio FROM users');
      res.json(users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Protected Endpoint (user profile)
  router.get('/profile', authenticateUser, async (req, res) => {
    try {
      const { username } = req.user;
      const [user] = await connection.query('SELECT name, username, bio FROM users WHERE username = ?', [username]);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      console.error('Error retrieving user profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
module.exports = router;