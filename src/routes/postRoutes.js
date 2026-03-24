import { Router } from "express";
import { createPost } from "../services/postService.js";
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

export default router;

