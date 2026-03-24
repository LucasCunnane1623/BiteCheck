import { Router } from "express";
import { createPost, likePost, getPosts, getMyPosts, addComment } from "../services/postService.js";
import { authenticate } from "../middleware/auth.js";
const router = Router();

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

export default router;

