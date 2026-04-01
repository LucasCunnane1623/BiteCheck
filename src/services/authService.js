import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import settings from '../config/settings.js';
import { getdb } from '../database/db.js';

export const registerUser = async (email, password, username, age) => {
    const db = getdb();
    const collection = db.collection('users');
    const existingUser = await collection.findOne({
        email
    });
    
    if (existingUser) {
        throw new Error('Email already in use');
    };

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await collection.insertOne({
        email,
        username,
        age: parseInt(age),
        password: hashedPassword,
        isAdmin: false,
        createdAt: new Date()
    });

    return result.insertedId;
};

export const loginUser = async (email, password) => {
    const db = getdb();
    const user = await db.collection('users').findOne({email});

    if (!user){
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch){
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        { 
            userId: user._id, 
            email: user.email,
            isAdmin: user.isAdmin
        },
        
        process.env.JWT_SECRET || settings.secret,
        { expiresIn: '7d' }
    )

    return {token, username: user.username, isAdmin: user.isAdmin};
}
