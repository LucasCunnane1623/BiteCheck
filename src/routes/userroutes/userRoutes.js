import { Router } from 'express';
import { getUserProfile } from '../../services/userService.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();


/**
 * @route GET /api/users/profile
 * @desc Get the authenticated user's profile information, including their posts and reviews.
 * @access Private (Authenticated users only)
 * @returns {Object} User profile data with recent posts and reviews.
 * @example
 * GET /api/users/profile
 */

router.get('/profile', authenticate, async (req, res, next) => {
    try{
        const userId = req.user.userId; // Extract userId from the authenticated token
        if (!userId){
            return res.status(400).json({ error: "invalid User Id"})
        }
        const profile = await getUserProfile(userId);

        if (!profile){
            return res.status(404).json({ error: "user not found"})
        }
        res.status(200).json({
            success: true, 
            data: profile
        });
    } catch (e){
        next(e);
    }
})

export default router;
