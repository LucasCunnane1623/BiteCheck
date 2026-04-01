import express from 'express';
import { registerUser, loginUser } from '../../services/authService.js';

const router = express.Router();


/**
 * @route POST /api/auth/register   
 * @desc Register a new user
 * @access Public
 * @body {string} email - User's email address (required)
 * @body {string} username - Desired username (required)
 * @body {string} password - User's password (required)
 * @body {number} age - User's age (optional, must be 13 or older to register)
 * @returns {Object} Confirmation message with the ID of the newly registered user.
 */
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password, age } = req.body;
        
        if(!email || !password || !username){
            return res.status(400).json({error: "All fields are required"});
        }

        if (age && age < 13){
            return res.status(403).json({
                error: "Underage: You must be 13 or older to use BiteCheck."
            })
        }
        
        const userId = await registerUser(email, password, username);
        res.status(201).json({ message: "User registered successfully", userId });
    } catch (err) {
        next(err);
    }
});


/**
 * @route POST /api/auth/login
 * @desc Authenticate a user and return a JWT token
 * @access Public
 * @body {string} email - Users email address (required)
 * @body {string} password - Users password (required)
 * @returns {Object} Confirmation message with the JWT token and user information.
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password} = req.body;
        
        if (!email || !password){
            return res.status(400).json({error: "Email and password required"})
        };

        const result = await loginUser(email, password);
        const {token, username, isAdmin} = result
        res.status(200).json({
            message: "Login Successful",
            token,
            username,
            isAdmin
        });
        
    } catch (err) {
        next(err);
    }
});

export default router;


