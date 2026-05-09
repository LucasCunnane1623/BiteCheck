import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorizeAdmin } from '../../middleware/admin.js';
import { getdb } from '../../database/db.js';
import { getAdminDashboardData, createAuditLog, searchRestaurantsAdmin, searchReviewsAdmin, getAllPostsAdmin } from '../../services/adminService.js';
import { ObjectId } from 'mongodb';

const router = Router();


/**
 * @route   GET /api/admin/dashboard
 * @desc    Renders the God View Dashboard
 * @access  Private (Admin Only)
 */
router.get('/dashboard', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const data = await getAdminDashboardData();
        
        res.render('admin/dashboard', {
            title: "BiteCheck | God View",
            layout: 'main',
            // Use 'member' to match your auth logic
            user: req.session.member, 
            stats: data.stats,
            moderationQueue: data.moderationQueue,
            systemLogs: data.systemLogs,
            // Capture success/error from query params for the flash message
            success: req.query.success,
            error: req.query.error 
        });
    } catch (e) {
        next(e);
    }
});

/**
 * @route POST /api/admin/restaurants
 * @desc Add a new restaurant to the database (Admin only).
 * @access Private (Authenticated users with admin role)
 * @body {string} name - Name of the restaurant (required)
 * @body {string} camis - Unique CAMIS identifier (required)
 * @body {string} boro - Borough where the restaurant is located (optional)
 * @body {string} cuisine - Type of cuisine served (optional)
 * @returns {Object} Confirmation message with the ID of the newly created restaurant.
 * @example
 * POST /api/admin/restaurants
 * {
 *   "name": "New Restaurant",
 *   "camis": "12345678",
 *   "boro": "Manhattan",
 *   "cuisine": "Italian"
 * }
 */
router.post('/restaurants', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { name, camis, boro, cuisine } = req.body;

        if (!name || !camis) {
            return res.status(400).redirect('/api/admin/dashboard?error=missing_fields');
        }

        const db = getdb();
        const existingRestaurant = await db.collection('restaurants').findOne({ camis: camis });
        
        if (existingRestaurant) {
            return res.status(409).redirect('/api/admin/dashboard?error=duplicate_camis');
        }
        
        // Security: Manually map fields to avoid mass-assignment vulnerabilities
        await db.collection('restaurants').insertOne({
            name: name.trim(),
            camis: camis.trim(),
            boro: boro?.trim() || "N/A",
            cuisine: cuisine?.trim() || "N/A",
            lastUpdated: new Date(),
            manualEntry: true
        });

        // Accountability Logging
        await createAuditLog(
            req.session.member.userId, 
            'ADD_RESTAURANT', 
            camis, 
            `Added ${name} to the database.`
        );

        res.redirect('/api/admin/dashboard?success=added');
    } catch (e) {
        next(e);
    }
});

/**
 * @route DELETE /api/admin/restaurants/:camis
 * @desc Remove a restaurant from the database (Admin only).
 * @access Private (Authenticated users with admin role)
 * @param {string} camis - Unique CAMIS identifier of the restaurant to be deleted (required)
 * @returns {Object} Confirmation message of successful deletion or error if restaurant not found.
 * @example
 * DELETE /api/admin/restaurants/12345678
 */

router.delete('/restaurants/:camis', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const db = getdb();
        const camis = req.params.camis;
        
        const restaurant = await db.collection('restaurants').findOne({ camis });
        if (!restaurant) return res.redirect('/api/admin/dashboard?error=notfound');

        const result = await db.collection('restaurants').deleteOne({ camis });

        if (result.deletedCount > 0) {
            await createAuditLog(
                req.session.member.userId, 
                'DELETE_RESTAURANT', 
                camis, 
                `Removed restaurant: ${restaurant.name}`
            );
        }

        res.redirect('/api/admin/dashboard?success=removed');
    } catch (e) {
        next(e);
    }
});

/**
 * @route DELETE /api/admin/reviews/id
 * @desc Remove a review from the database (Admin only).
 * @access Private (Authenticated users with admin role)
 * @param {string} Id - Unique ObjectId for reviews to be deleted (required)
 * @returns {Object} Confirmation message of successful deletion or error if review not found.
 * @example
 * DELETE /api/admin/reviews/12345678
 */
router.delete('/reviews/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const db = getdb();
        const reviewId = req.params.id;
        const { returnUrl } = req.body;
        // 1. Validation: Ensure the ID is a valid hex string for MongoDB
        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).redirect('/api/admin/dashboard?error=invalid_id');
        }

        // 2. Perform the deletion
        const result = await db.collection('reviews').deleteOne({ 
            _id: new ObjectId(reviewId) 
        });

        if (result.deletedCount === 0) {
            return res.status(404).redirect('/api/admin/dashboard?error=review_not_found');
        }

        // 3. Accountability Log
        await createAuditLog(
            req.session.member.userId, 
            'DELETE_REVIEW', 
            reviewId, 
            "Admin force-removed reported content."
        );
        
        if (returnUrl) {
            return res.redirect(returnUrl);
        }

        //res.redirect('/api/admin/dashboard?success=review_deleted');
        return res.redirect('/api/admin/dashboard?success=review_deleted'); 

    } catch (e) {
        next(e);
    }
});

/**
 * @route GET /api/admin/posts
 * @desc Get all posts in the system for moderation (Admin only).
 * @access Private (Authenticated users with admin role)
 * @query {string} lastId - ID of the last post from the previous page (for pagination, optional)
 * @query {number} limit - Number of posts to return per page (optional, default: 20)
 * @returns {Object} List of posts with pagination info for admin review.
 * @example
 * GET /api/admin/posts?lastId=60f5a3b2c9d1e8a1b2c3d4e&limit=20
 */
router.get('/posts', authenticate, authorizeAdmin, async (req, res, next) => {
    try{
        const lastId = req.query.lastId || null;
        const limit = parseInt(req.query.limit) || 20;

        const posts = await getAllPostsAdmin(lastId, limit);

        res.json({
            success: true, 
            count: posts.length,
            data:posts
        })
    } catch (e) {
        next(e)
    }
});

/**
 * @route   GET /api/admin/search/restaurants
 * @desc    Find restaurants for management
 */
router.get('/search/restaurants', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) return res.redirect('/api/admin/dashboard');

        const results = await searchRestaurantsAdmin(query);

        res.render('admin/search-results', {
            title: "BiteCheck | Restaurant Search",
            searchType: "Restaurants",
            query,
            results,
            isRestaurantSearch: true,
            user: req.session.member
        });
    } catch (e) {
        next(e);
    }
});

/**
 * @route   GET /api/admin/search/reviews
 * @desc    Find reviews for moderation
 */
router.get('/search/reviews', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) return res.redirect('/api/admin/dashboard');

        const results = await searchReviewsAdmin(query);

        res.render('admin/search-results', {
            title: "BiteCheck | Review Search",
            searchType: "Reviews",
            query,
            results,
            isReviewSearch: true,
            user: req.session.member
        });
    } catch (e) {
        next(e);
    }
});

export default router;
