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
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.json({ message: "Login successful", ...result });
    } catch (err) {
        next(err);
    }
});

export default router;  