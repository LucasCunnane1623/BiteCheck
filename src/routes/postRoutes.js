import { Router } from "express";
import { createPost, likePost, getPosts, getMyPosts, addComment } from "../services/postService.js";
import { authenticate } from "../middleware/auth.js";
import { reportPost } from "../services/postService.js";
const router = Router();



/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private (Authenticated users only)
 * @body {string} content - The content of the post (required, max 1000 characters)
 * @returns {Object} Confirmation message with the ID of the newly created post.
 * @example
 * POST /api/posts
 * {
 *   "content": "This is my review of the restaurant. It was great!"
 * }
 */
router.post('/', authenticate, async(req, res, next) =>{
    try{
        const { content } = req.body;

        if (! content || typeof content !== "string" || content.trim().length === 0){
            const error = new Error("Post content cannot be empty")
            error.statusCode = 400;
            throw error
        }

        if (content.length > 1000){
            const error = new Error("Post is too long (1000 characters max)")
            error.statusCode = 400;
            throw error
        }

        const result = await createPost(req.user.userId, content);
        res.status(201).json({success: true, postId: result.insertedId, message: "Post created successfully"})
    } catch (e) {
        next(e)
    }
});

/**
 * @route PATCH /api/posts/:id/like
 * @desc Like or unlike a post
 * @access Private (Authenticated users only)
 * @param {string} id - The ID of the post to like/unlike (required)
 * @returns {Object} Confirmation message with the updated like status.
 */
router.patch('/:id/like', authenticate, async(req, res, next) =>{
    try{
        const postId = req.params.id;
        const userId = req.user.userId;

        const result = await likePost(postId, userId);
        res.status(200).json({
            success: true,
            message: "Post interaction updated",
            details: result
        });
    } catch (e) {
        next(e);
    }
});

/**
 * @route GET /api/posts
 * @desc Get a paginated list of all posts, sorted by most recent.
 * @access Public
 * @query {number} page - Page number for pagination (optional, default: 1)
 * @query {number} limit - Number of posts per page (optional, default: 10)
 * @returns {Object} Paginated list of posts with metadata.
 * @example
 * GET /api/posts?page=2&limit=5
 * 
 * DONT GET CONFUSED WITH GET /api/posts/me, 
 * THIS ENDPOINT GETS ALL POSTS IN THE SYSTEM,
 * NOT JUST THE USERS POSTS
 * 
 * originally created for infinite scrolling on the home feed,
 * but can also be used for general browsing of posts
 * 
 * Also if you are wondering why we have 2 '/' path routes the
 * upper one is post method and this one is get method, so they are different routes
 * even though they have the same path
 */
router.get('/', async (req, res, next)=>{
    try{
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const posts = await getPosts(page, limit);

        res.status(200).json({
            success: true,
            page: page, 
            count:posts.length,
            data: posts
        });
    } catch (e) {
        next(e);
    }
});


/** 
 * @route GET /api/posts/me 
 * @desc Get a paginated list of the authenticated user's posts, sorted by most recent.
 * @access Private (Authenticated users only)
 * @query {number} page - Page number for pagination (optional, default: 1)
 * @query {number} limit - Number of posts per page (optional, default: 10)
 * @returns {Object} Paginated list of the user's posts with metadata.
 * @example
 * GET /api/posts/me?page=1&limit=5
 * 
 */
router.get('/me', authenticate, async (req, res, next)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);
        const userId = req.user.userId;

        const posts = await getMyPosts(userId, page, limit);
        res.status(200).json({
            success: true, 
            message: "Your posts retrieved successfully",
            page, 
            count: posts.length,
            data: posts
        });
        
    } catch (e){
        next(e);
    }
});


/**
 * @route POST /api/posts/:id/comments
 * @desc Add a comment to a post
 * @access Private (Authenticated users only)
 * @param {string} id - The ID of the post to comment on (required)
 * @body {string} text - The content of the comment (required, max 500 characters)
 * @returns {Object} Confirmation message with the ID of the newly added comment.
 * @example
 * POST /api/posts/60f5a3b2c9d1e8a1b2c3d4e/comments
 * {
 *   "text": "This is a great post!"
 * }
 */
router.post('/:id/comments', authenticate, async (req, res, next)=>{
    try{
        const { text }= req.body;
        const postId = req.params.id
        const {userId, username} = req.user

        if (!text || text.trim().length === 0){
            return res.status(400).json({error: "Comment cannot be empty"});
        }

        const result = await addComment(postId, userId, username, text);

        res.status(201).json({
            success: true, 
            message: "Comment Added!",
            details: result
        })
    } catch (e) {
        next(e);
    }
});


/**
 * @route PATCH /api/posts/:id/report  
 * @desc Report a post for inappropriate content
 * @access Private (Authenticated users only)
 * @param {string} id - The ID of the post to report (required)
 * @body {string} reason - The reason for reporting the post (required, max 500 characters)
 * @returns {Object} Confirmation message of successful report submission.
 * @example
 * PATCH /api/posts/60f5a3b2c9d1e8a1b2c3d4e/report
 * {
 *   "reason": "This post contains inappropriate content."
 * }
 */
router.patch('/:id/report', authenticate, async (req, res, next)=>{
    try{
        const { reason } = req.body;
        if (!reason || reason.trim().length === 0){
            return res.status(400).json({error: "Report reason cannot be empty"});
        }

        await reportPost(req.params.id, req.user.userId, reason);
        res.status(200).json({
            success: true,
            message: "Post reported successfully"
        });
    } catch (e) {
        next(e);
    }
});


export default router;

