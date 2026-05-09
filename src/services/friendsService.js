//data functions for gettings friends, adding friends, and deleting friends
import { ObjectId } from "mongodb";
import { getdb } from "../database/db.js"
import validation from "../helpers.js";


export const getFriends = async (userId) => {
    const db = getdb();

    if (!userId || !ObjectId.isValid(userId)){
        const error = new Error("Invalid User Id format")
        throw error;
    }

    //data method call 
    const result = await db.collection('users').findOne(
        {_id: new ObjectId(userId)},
        {projection: {friends: 1}} //only return the friends field of the user document
    );
    if (!result) return null; //if user not found, return null
    return result.friends; //return the array of friend userIds
}

export const addUserToFriendsList = async (userId, friendId) => {
    const db = getdb();

    try {
        userId = validation.checkId(userId,"userId");
        friendId = validation.checkId(friendId,"friendId");

        //console.log(`Adding friend. userId: ${userId}, friendId: ${friendId}`);
        const userObjectId = new ObjectId(userId);
        const friendObjectId = new ObjectId(friendId);
        const user = await db.collection('users').findOne({_id: userObjectId});
        if (!user) {
            throw new Error("User not found");
        }
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
        //some is very useful for checking if at LEAST one element in the array meets the cond.
        
        if(user.friends.some(id => id.toString() === friendObjectId.toString())){//kinda redundant to toString the ids since we should be getting the ids as strings from the client, but just to be safe since 
            throw new Error("This user is already in your friends list");
        }
        const updatedFriendsList = [...user.friends, friendObjectId.toString()]; //add the friendId to the user's friends list
        const result = await db.collection('users').updateOne(
            { _id: userObjectId },
            { $set: { friends: updatedFriendsList } }
        );

        if (result.matchedCount === 0) {
            throw new Error("User not found");
        }

        return true; //addition successful
    } catch (error) {
        throw error;
    }
}

export const addUserToBlockedList = async (userId, blockId) => {
    const db = getdb();

    try {
        userId = validation.checkId(userId,"userId");
        blockId = validation.checkId(blockId,"blockId");

        //console.log(`Adding friend. userId: ${userId}, friendId: ${friendId}`);
        const userObjectId = new ObjectId(userId);
        const blockObjectId = new ObjectId(blockId);
        const user = await db.collection('users').findOne({_id: userObjectId});
        if (!user) {
            throw new Error("User not found");
        }
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
        //some is very useful for checking if at LEAST one element in the array meets the cond.
        
        if(user.blockedUsers.some(id => id.toString() === blockObjectId.toString())){//kinda redundant to toString the ids since we should be getting the ids as strings from the client, but just to be safe since 
            throw new Error("This user is already in your blocked list");
        }
        const updatedBlockedList = [...user.blockedUsers, blockObjectId.toString()]; //add the blockId to the user's blocked list
        const result = await db.collection('users').updateOne(
            { _id: userObjectId },
            { $set: { blockedUsers: updatedBlockedList } }
        );

        if (result.matchedCount === 0) {
            throw new Error("User not found");
        }

        return true; //addition successful
    } catch (error) {
        throw error;
    }
}

export const removeUserFromFriendsList = async (userId, friendId) => {
    const db = getdb();
    
    if (!userId || !ObjectId.isValid(userId) || !friendId || !ObjectId.isValid(friendId)){
        const error = new Error("Invalid User Id format")
        throw error;
    }
    //fetch the user document to get the current friends list
    const userObjectId = new ObjectId(userId);
    const friendObjectId = new ObjectId(friendId);

    const user = await db.collection('users').findOne({_id: userObjectId});
    if (!user) {
        throw new Error("User not found");
    }
    
    //remove the friendId from the user's friends list
    const updatedFriendsList = user.friends.filter(id => id.toString() !== friendObjectId.toString()); 
    //update the user document with the new friends list
    const result = await db.collection('users').updateOne(
        { _id: userObjectId },
        { $set: { friends: updatedFriendsList } }
    );

    if (result.matchedCount === 0) {
        throw new Error("User not found");
    }

    return true; //removal successful
}

//helper function to check if a user is blocked by another user 
export const isUserBlocked = async (userId, otherUserId) => { //returns a boolean indicating whether the user is blocked by the other user
    const db = getdb();
    try {
        userId = validation.checkId(userId,"userId");
        otherUserId = validation.checkId(otherUserId,"otherUserId");

        const userObjectId = new ObjectId(userId);
        const otherUserObjectId = new ObjectId(otherUserId);
        const user = await db.collection('users').findOne({_id: userObjectId});
        if (!user) {
            throw new Error("User not found");
        }
        //check if the other user's id is in the user's blocked list
        if(user.blockedUsers.some(id => id.toString() === otherUserObjectId.toString())){
            return true; //the user is blocked by the other user
        }
        return false; //the user is not blocked by the other user
    } catch (error) {
        throw error;
    }
}