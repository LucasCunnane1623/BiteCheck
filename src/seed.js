// A temporary "Seeder" function to test your God View
import { getdb } from "./database/db.js";

export const seedTestReviews = async () => {
    const db = getdb();
    const mockReviews = [
        { comment: "The food here was amazing!", reports: 0, userId: "user_1", createdAt: new Date() },
        { comment: "Terrible service, avoid this place.", reports: 3, userId: "user_2", createdAt: new Date() },
        { comment: "SPAM CLICK THIS LINK FOR FREE PIZZA", reports: 12, userId: "hacker_99", createdAt: new Date() }
    ];
    await db.collection('reviews').insertMany(mockReviews);
};