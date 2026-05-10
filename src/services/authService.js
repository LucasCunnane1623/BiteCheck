import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import settings from '../config/settings.js';
import { getdb } from '../database/db.js';

export const registerUser = async (email, password, username, age,firstName,lastName) => {
    const db = getdb();
    const collection = db.collection('users');
    const existingUser = await collection.findOne({
        email : {$regex : new RegExp(`^${email}$`,"i")}//case insensitive email 
    });
    
    if (existingUser) {
        throw new Error('Email already in use');
    };

    const hashedPassword = await bcrypt.hash(password, 12);

    if (isNaN(age) || age < 13 || age > 120){
        throw new Error('Invalid age. Age must be a number between 13 and 120.');
    }
    const result = await collection.insertOne({
        profilePhoto : "/uploads/profilePhotos/defaultProfile.jpg",
        firstName : firstName,
        lastName : lastName,
        status : "Public", //default status is private, but user can change it to public if they want to share their profile with other users.
        appSearchRadiusMeters: 500, //default search radius is 500 meters 
        favRestaurants : [], //array of restaurant ids that the user has favorited
        friends : [], //array of user ids that the user is friends with
        blockedUsers : [], //array of user ids that the user has blocked, 
        email: email.toLowerCase(), //store email in lowercase to make it easier to do case insensitive search
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
    const user = await db.collection('users').findOne({email
        : {$regex : new RegExp(`^${email}$`,"i")}//case insensitive email
    });

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

    return {token, username: user.username, isAdmin: user.isAdmin,userId: user._id};
}
