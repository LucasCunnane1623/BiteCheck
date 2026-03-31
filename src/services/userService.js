import { ObjectId } from "mongodb";
import { getdb } from "../database/db.js"

export const getUserProfile = async (userId) => {
    const db = getdb();
    
    if (!userId || !ObjectId.isValid(userId)){
        const error = new Error("Invalid User Id format")
        throw error;
    }


    const userObjectId = new ObjectId(userId);

    // fetch user info from the database, excluding the password field for security reasons
    const user = await db.collection('users').findOne(
        {_id: userObjectId},
        {projection: {password: 0}} // Exclude the password field from the result
    );
    // if user is not found, return null
    if (!user) return null;

    // count the number of posts made by the user
    const postCount = await db.collection('posts').countDocuments({
        userId: userObjectId
    });

    return {
        ...user, 
        stats: {
            postCount
        }
    };
};
