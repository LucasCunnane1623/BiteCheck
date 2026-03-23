import express from 'express';
import { registerUser, loginUser } from '../services/authService.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const userId = await registerUser(email, password, username);
        res.status(201).json({ message: "User registered successfully", userId });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password, age } = req.body;
        if (age < 13){
            res.json({message: "user is underage: You have to be above 13 to use this application"})
        }
        if (email === 'test@example.com' && password === "password123"){
            return res.status(200).json({
                message: "Success",
                token: "your token here"
            });
        };
        //const result = await loginUser(email, password, age);
        res.status(401).json({message : "Invalid credentials"})
        
    } catch (err) {
        next(err);
    }
});

export default router;


