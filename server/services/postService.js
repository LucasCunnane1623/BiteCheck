import { ObjectId } from "mongodb";
import { getdb } from "../database/db"

export const createPost = async (userId, content) => {
    const db = getdb()
    return await db.collection('posts').insertOne({
        userId, 
        content, 
        likes: [],   // this array will store the userid so no users can make multiple likes (broken system/feature)
        dislikes: [], // same as above
        comments: [], // $push , for when we new comments need to be pushed.
        createdOn: new Date()
    });
};

export const addComment = async (postId, userId, text) => {
    const db = getdb()
    return await db.collection('posts').updateOne(
        { _id: ObjectId(postId) },
        {$push: {comments: {userId, text, date: new Date()}}}
    );
};


export const likePost = async (postId, userId) => {
    const db = getdb();
    return await db.collection('posts').updateOne(
        {_id: ObjectId(postId)},
        {
            $addToSet: {likes: userId}, // adds only if the userid is not present
            $pull: { dislikes: userId} // removes from the dislikes if present
        }
    );
};

