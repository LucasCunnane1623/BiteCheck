import { Router } from 'express';
import { getUserProfile } from '../../services/userService.js';
import { authenticate,redirectToLanding } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { getdb } from '../../database/db.js';

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
});

/**
 * @route GET /api/users/me
 * @desc Returns current user including saved filter preference
 * @access Private
 */
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const db = getdb();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(req.user.userId) },
            { projection: { filterPref: 1 } }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ filterPref: user.filterPref || 'all' });
    } catch (e) {
        next(e);
    }
});

/**
 * @route PATCH /api/users/filter-pref
 * @desc Save the user's traffic light filter preference
 * @access Private
 */
router.patch('/filter-pref', authenticate, async (req, res, next) => {
    try {
        const db = getdb();
        const { filterPref } = req.body;
        const allowed = ['all', 'green', 'yellow', 'red'];

        if (!allowed.includes(filterPref)) {
            return res.status(400).json({ error: 'Invalid filter preference' });
        }

        await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.userId) },
            { $set: { filterPref } }
        );

        res.status(200).json({ success: true });
    } catch (e) {
        next(e);
    }
});

export default router;
