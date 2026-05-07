import { ObjectId } from 'mongodb';
import { getdb } from '../database/db.js';
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ error: "Access Denied, no token provided"})
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "syFzeOTlrfAiLN3g6OpxmH1fGFBM7PlmF2b87L7TMX7");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });           
    };
};


export const checkReviewOwnership = async (req, res, next) => {
    const { id } = req.params;
    const {userId} = req.body;

    try {
        const db = await getdb();
        const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });

        if (!review) {
            return res.status(404).json({error:  "Review not found"});
        }

        if (review.userId !== userId){
            return res.status(403).json({error: "Unauthorized to modify this review"});
        }
        next(); // If ownership is verified, proceed to the next middleware or route handler
    } catch (err) {
        res.status(500).json({error: "Failed to verify review ownership"});
    }
}