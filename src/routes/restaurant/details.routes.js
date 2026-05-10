import express from 'express';
import { getdb } from '../../database/db.js';
import { ObjectId } from 'mongodb';

// Services and Middleware
import { authenticate, checkReviewOwnership } from '../../middleware/auth.js';
import { addReview, getRestaurantReviews } from '../../services/reviewService.js';
import { getRestaurantDetails } from '../../services/restaurantService.js';


const router = express.Router();


/**
 * @router GET /api/restaurants/view/:camis
 * @desc  Get detailed information about a specific restaurant, including recent inspections and community reviews.
 * @access Public
 * @param {string} camis - Unique identifier for the restaurant (required)
 * @returns {Object} Detailed restaurant information with hygiene status and community buzz.
 * @example
 * GET /api/restaurants/12345678
 */

router.get('/view/:camis', async (req, res, next) => {
    try{
        // we use getRestaurantDetails service to get the restaurant details, which includes the restaurant info, recent inspections, and communityBuzz.

        const details = await getRestaurantDetails(req.params.camis);
        
        if (!details){
            return res.status(404).json({ error: "Restaurant not found"})
        }
        res.status(200).json({
            success: true,
            data: details
        })
    } catch (e) {
        next(e)
    }
});


/**
 * @route GET /api/restaurants/:id/risk-profile
 * @desc Provides a risk profile for a specific restaurant based on recent critical violations.
 * @access Public
 * @param {string} id - Unique identifier for the restaurant (camis) (required)
 * @returns {Object} Risk profile including overall status and recent critical risks.
 * @example
 * GET /api/restaurants/12345678/risk-profile
 */

router.get('/:id/risk-profile', async (req, res, next) => {
    try {
        const db = getdb();
        const restaurant = await db.collection('restaurants').findOne({ camis: req.params.id });

        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

        const recentCriticalRisks = (restaurant.inspections || [])
            .filter(i => i.isCritical && new Date(i.date) > new Date(Date.now() - 31536000000))
            .map(i => ({
                violation: i.description,
                illness: i.potentialIllness,
                severity: i.riskSeverity
            }));
        
        res.json({
            name: restaurant.name,
            overallStatus: recentCriticalRisks.length > 0 ? 'DANGER' : 'SAFE',
            risks: recentCriticalRisks
        });
    } catch (err) {
        next(err);
    }
});


/**
 * @route GET /api/restaurants/:camis/logs
 * @desc Returns all inspection logs for a restaurant
 * @access Public
 */
router.get('/:camis/logs', async (req, res, next) => {
    try {
        const db = getdb();
        const restaurant = await db.collection('restaurants').findOne(
            { camis: req.params.camis },
            { projection: { name: 1, inspections: 1 } }
        );

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        res.status(200).json({
            name: restaurant.name,
            inspections: restaurant.inspections || []
        });
    } catch (e) {
        next(e);
    }
});


/**
 * @route GET /api/restaurants/:camis/reviews
 * @desc Get all reviews for a specific restaurant, sorted by most recent.
 * @access Public
 * @param {string} camis - Unique identifier for the restaurant (required)
 * @returns {Array} List of reviews with user info and timestamps.
 * @example
 * GET /api/restaurants/12345678/reviews
 */
router.get('/:camis/reviews', async (req, res, next) => {
    try {
        const reviews = await getRestaurantReviews(req.params.camis);
        res.json(reviews);  
    } catch (err) {
        next(err);
    }
});



/**
 * @route POST /api/restaurants/reviews
 * @desc Submit a User review regarding hygiene or basically anything.
 * @access Private (Authenticated users only)
 * @body {string} camis - unique identifier for the restaurant (required)
 * @body {string} comment - User's review comment (required)
 * @returns {Object} Confirmation message with the ID of the created review.
 * @example
 * POST /api/restaurants/reviews
 * {
 *   "camis": "12345678",
 *   "comment": "Had a great experience! Very clean and hygienic."
 * }
 */
router.post('/reviews', authenticate, async (req, res, next) => {
    try {
        const result = await addReview({ ...req.body, userId: req.user.userId });
        res.status(201).json({ message: "Review Posted!", id: result.insertedId });
    } catch (err) {
        next(err);
    }
});



/**
 * @route PATCH /api/restaurants/reviews/:id
 * @desc Edit a review (Owner only).
 * @access Private (Authenticated users only, review owner)
 * @param {string} id - Unique identifier for the review (required)
 * @body {string} comment - Updated review comment (required)
 * @returns {Object} Confirmation message of successful update.
 * @example
 * PATCH /api/restaurants/reviews/60f5a3b2c9d1e8a1b2c3d4e
 * {
 *   "comment": "Updated review: The hygiene has improved significantly!"
 * }
 */
router.patch('/reviews/:id', authenticate, checkReviewOwnership, async (req, res, next) => {
    const { id } = req.params;
    const { comment } = req.body;

    try {
        const db = getdb();
        const result = await db.collection('reviews').updateOne(
            { _id: new ObjectId(id) },
            { $set : { comment: comment, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) return res.status(404).json({ error: "Review not found" });
        res.json({ message: "Review updated successfully" });
    } catch (err) {
        next(err);
    }
});


/**
 * @route DELETE /api/restaurants/reviews/:id
 * @desc Delete a review (Owner only).
 * @access Private (Authenticated users only, review owner)
 * @param {string} id - Unique identifier for the review (required)
 * @returns {Object} Confirmation message of successful deletion.
 * @example
 * DELETE /api/restaurants/reviews/60f5a3b2c9d1e8a1b2c3d4e  
 */
router.delete('/reviews/:id', authenticate, checkReviewOwnership, async (req, res, next) => {
    const { id } = req.params;

    try {
        const db = getdb();
        const result = await db.collection('reviews').deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) return res.status(404).json({ error: "Review not found" });
        res.json({ message: "Review deleted successfully" });
    } catch (err) {
        next(err);
    }
});



export default router;