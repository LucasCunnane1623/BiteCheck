import { ObjectId } from "mongodb";
import { getdb } from "../database/db.js"


/**
 * 
 */
export const getPosts = async (page = 1, limit = 10) => {
    const db = getdb();
    const skip = (page - 1)*limit;

    return await db.collection('posts')
        .find()
        .sort({createdOn: -1})
        .skip(skip)
        .limit(limit)
        .toArray();
};

export const createPost = async (userId, content) => {
    const db = getdb()
    return await db.collection('posts').insertOne({
        userId: new ObjectId(userId), 
        content, 
        likes: [],   // this array will store the userid so no users can make multiple likes (broken system/feature)
        dislikes: [], // same as above
        // comments will be in the form {userId:"fwef0w8gw82j3", comment:"cool post!"}
        comments: [], // $push , for when we new comments need to be pushed. 
        createdOn: new Date()
    });
};

export const addComment = async (postId, userId, username, text) => {
    const db = getdb()
    const comment = {
        commentId: new ObjectId(),
        userId: new ObjectId(userId),
        username,
        text,
        createdOn: new Date()
    }
    return await db.collection('posts').updateOne(
        { _id: new ObjectId(postId) },
        {$push: {comments: comment}}
    );
};


export const likePost = async (postId, userId) => {
    const db = getdb();

    if (!ObjectId.isValid(postId)){
        throw new Error("thats not a valid ID!")
    };

    const postObjectId = new ObjectId(postId)

    const post = await db.collection('posts').findOne({_id: postObjectId});

    if (!post){
        throw new Error("post not found")
    };

    const hasliked = post.likes.includes(userId);
    if (hasliked){
        return await db.collection('posts').updateOne(
            {_id: postObjectId},
            {$pull: {likes: userId}}
        )
    } else {
        return await db.collection('posts').updateOne(
            {_id: postObjectId},
            {
            $addToSet: {likes: userId}, // adds only if the userid is not present
            $pull: { dislikes: userId} // removes from the dislikes if present
            }
        );
    }  
};

export const getMyPosts = async (userId, page = 1, limit = 10) => {
    const db = getdb();
    const skip = (page-1)*limit;

    return await db.collection('posts')
        .find({userId: new ObjectId(userId) })
        .sort({ createdOn: -1})
        .skip(skip)
        .limit(limit)
        .toArray();
}


export const getAllPostsAdmin = async (lastId = null, limit= 20) => {
    const db = getdb();
    // empty filter
    let query = {};

    if (lastId && ObjectId.isValid(lastId)){
        query._id = {$lt: new ObjectId(lastId)}
    }

    return await db.collection('posts')
        .find(query)
        .sort({_id: -1})
        .limit(limit)
        .toArray(); 

}

export const reportPost = async (postId, userId, reason) => {
    const db = getdb();

    if (!ObjectId.isValid(postId)){
        throw new Error("thats not a valid ID!")
    };

    return await db.collection('posts').updateOne(
        {_id: new ObjectId(postId)},
        {   // prevents duplicate reports from the same user and also adds the report reason and timestamp
            $addToSet:{
                reports: {userId: new ObjectId(userId), reason, reportedOn: new Date()}
            },
            $set: {isFlagged: true} // Mark for easy admin filtering
        }
    )   
};   
