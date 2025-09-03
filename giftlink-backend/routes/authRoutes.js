// Import necessary packages
const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');

// Create a Pino logger instance
const logger = pino();

dotenv.config();

// Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        // Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();
        // Access MongoDB collection
        const collection = db.collection("users");
        // Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });

        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }
        
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;
        // Save user details in database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });
        // Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({authtoken,email});
    } catch (e) {
        logger.error(e)
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        // Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();
        // Access MongoDB `users` collection
        const collection = db.collection("users");
        // Check for user credentials in database
        const theUser = await collection.findOne({ email: req.body.email });
        // Check if the password matches the encrypyted password and send appropriate message on mismatch
        if (theUser) {
            let result = await bcryptjs.compare(req.body.password, theUser.password);
            if(!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong password' });
            }
            // Fetch user details from database
            const userName = theUser.firstName;
            const userEmail = theUser.email;
            // Create JWT authentication if passwords match with user._id as payload
            let payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET);
            logger.info('User logged in successfully');
            return res.status(200).json({authtoken, userName, userEmail});
        } else {
            // Send appropriate message if user not found
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: 'Internal server error', details: e.message});
    }
});

module.exports = router;