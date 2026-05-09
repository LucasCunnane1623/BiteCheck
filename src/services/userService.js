import { ObjectId } from "mongodb";
import { getdb } from "../database/db.js"
import validation from "../helpers.js";


//use the validation.checkId method in try catch blocks to replace the object ID is valid calls 
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


export const updateUserInfo = async (userId, userData) => {
    const db = getdb();

    if (!userId || !ObjectId.isValid(userId)){
        const error = new Error("Invalid User Id format")
        throw error;
    }
    const userObjectId = new ObjectId(userId);
    let usersCollection = db.collection('users');

    let result = await usersCollection.updateOne(
        { _id: userObjectId },
        { $set: userData }
    );

    if (result.matchedCount === 0) {
        throw new Error("User not found");
    }


    return true; //update successful
}

export const getUserByUsername = async (username) => {
    const db = getdb();
    if (!username || typeof username !== "string"){
        const error = new Error("Invalid Username format")
        throw error;
    }

    const usersCollection = db.collection('users');
    const matchingUsers = await usersCollection.find({
        username : {$regex : new RegExp(username,"i")} //case insensitive search for usernames that match the query
    }).toArray();

    return matchingUsers.map(user => ({ //return only these feils for the matching user, since this is all we need to display
        _id: user._id,
        username: user.username,
        profilePhoto: user.profilePhoto,
        profileLink: `/api/users/profile/${user._id.toString()}`,
        addLink: `/api/users/add/${user._id.toString()}`
    }));
}

