import { getdb } from "../database/db.js";
import { ObjectId } from "mongodb";

export const addReview = async (reviewData) => {
    const db = await getdb();
    const { restaurantCamis, userId, rating, photoUrl } = reviewData;

    const newReview = {
        restaurantCamis,
        userId,
        rating : parseInt(rating),
        comment, 
        photoUrl: photoUrl || null,
        createdAt: new Date()
    };

    const result = await db.collection('reviews').insertOne(newReview);
    return result;
};

export const getRestaurantReviews = async (camis) => {
    const db = await getdb();
    return await db.collection('reviews')
    .find({ restaurantCamis: camis})
    .sort({ createdAt: -1})
    .limit(10)
    .toArray();
};

export const getUserReviews = async (userId) => {
    const db = await getdb();
    return await db.collection('reviews')
    .find({ userId })
    .sort({ createdAt: -1})
    .limit(10)
    .toArray();
};

export const deleteReview = async (reviewId, userId) => {
    const db = await getdb();
    return await db.collection('reviews').deleteOne({
        _id: ObjectId(reviewId),
        userId: userId
    });
};

export const updateReview = async (reviewId, userId, newComment) => {
    const db = await getdb();
    return await db.collection('reviews').updateOne(
        { _id: ObjectId(reviewId), userId: userId },
        { $set: { comment: newComment, updatedAt: new Date() } }
    );
};

