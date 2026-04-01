import express, { raw } from 'express';
import { ObjectId } from 'mongodb';
import { getdb } from '../database/db.js';
import settings from '../config/settings.js';

// Services and Middleware
import { getStatusColor } from '../services/hygiene.js';
import { validateLocation } from '../middleware/validator.js';
import { authenticate, checkReviewOwnership } from '../middleware/auth.js';
import { addReview, getRestaurantReviews } from '../services/reviewService.js';
import { getRestaurantDetails, getUniversalSuggestions, searchRestaurants } from '../services/restaurantService.js';

const router = express.Router();

/**
 * @route GET /api/restaurants/near
 * @desc Geospatial Search: Finds restaurants within a specified radius (meters).
 * @access Public
 * @query {number} lng - User's current longitude (required)
 * @query {number} lat - User's current latitude (required)
 * @query {number} dist - Search radius in meters (optional, default: 500m)
 * @returns {Array} List of nearby restaurants with hygiene status and top risk.
 * @example
 * GET /api/restaurants/near?lng=-73.935242&lat=40.730610&dist=1000
 */
router.get('/near', validateLocation, async (req, res, next) => {
    const { lng, lat, dist } = req.query;

    try {
        const db = getdb();
        const restaurants = await db.collection(settings.mongo.collections.restaurants).find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(dist) || 500
                }
            }
        }).limit(50).toArray();
        
        const detailedRestaurants = restaurants.map(r => ({
            ...r,
            safetyStatus: getStatusColor(r.inspections || []),
            topRisk: r.inspections?.find(i => i.isCritical)?.potentialIllness || "No major risks"
        }));
        
        res.json(detailedRestaurants);
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/restaurants/suggest
 * @desc provides real-time search as you type suggestions for the search bar
 * @access Public
 * @query {string} q - the search query
 * @returns {object} json object containing a success boolean and a data
 * array of suggestion objects with computed safetystatus
 * @example:- 
 * GET /api/restaurants/suggest?q=chi
 * response : {"success": true, "data": [{text: "chinese", type: category}, {text: "chipotle", type: restaurant}.....]}
 * 
 */

router.get('/suggest', async (req, res, next) => {
    try{
        const {q} = req.query;
        // prevents single character queries from hitting the db 
        // can be changed hit the db as well
        if (!q || q.length < 2 || q.trim().length === 0){
            return res.json({success: true, data: []})
        }
        // call the function
        const rawResults = await getUniversalSuggestions(q)
        // extract the suggestions from the aggregate facet
        const suggestions = rawResults[0]?.suggestions || [];
        // compute the bitecheck health color for each restaurant
        const detailedSuggestions = suggestions.map(item => {
            if (item.type === 'restaurant'){
                return {
                    ...item,
                    safetyStatus: getStatusColor(item.inspections||[])
                };
            }
            // categories(cuisines) return as it is without a health check
            return item;
        });

        // send the finalized list back to the client
        res.status(200).json({
            success: true, 
            data: detailedSuggestions
        });
    } catch (e){
        // centralized middleware which handles errors
        next(e);
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


/**
 * @router GET /api/restaurants/search
 * @desc  TEXT-based search using MongoDB's text index. Searches across name, address, and cuisine fields.
 * @access Public
 * @query {string} q - Search query (required)
 * @returns {Array} List of matching restaurants sorted by relevance.
 * @example
 * GET /api/restaurants/search?q=pizza
 */

router.get('/search', async(req, res, next)=>{
    try{
        const query  = req.query.q;  // eg. query = pizza or burger or anything.. 
        
        if (!query || query.trim().length === 0){
            return res.status(400).json({ error: "Search query must be at least 2 characters long"})
        };

        const results = await searchRestaurants(query);
        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        })
    } catch (e) {
        next(e)
    };
});

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




export default router;