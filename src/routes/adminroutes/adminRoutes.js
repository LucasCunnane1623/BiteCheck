import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { authenticate } from '../../middleware/auth.js';
import { authorizeAdmin } from '../../middleware/admin.js';
import { getdb } from '../../database/db.js';
import { 
    getAdminDashboardData, 
    createAuditLog, 
    searchRestaurantsAdmin, 
    searchReviewsAdmin, 
    searchPostsAdmin,
    getAllPostsAdmin,
    getTopReportedPosts,
    getTopReportedReviews 
} from '../../services/adminService.js';

const router = Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Renders the God View Dashboard including stats, audit logs, 
 * and the Top 20 most reported reviews and posts for proactive moderation.
 * @access  Private (Admin Only)
 */
router.get('/dashboard', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        // Fetch general stats and system logs
        const data = await getAdminDashboardData();
        
        // Fetch the "Top 20" most reported items specifically for the Priority Hub
        const topReviews = await getTopReportedReviews(20);
        const topPosts = await getTopReportedPosts(20);

        res.render('admin/dashboard', {
            title: "BiteCheck | God View",
            layout: 'main',
            user: req.session.member, 
            stats: data.stats,
            topReviews, // High-priority flagged reviews
            topPosts,   // High-priority flagged posts
            moderationQueue: data.moderationQueue,
            systemLogs: data.systemLogs,
            success: req.query.success,
            error: req.query.error 
        });
    } catch (e) {
        next(e);
    }
});

/**
 * @route   POST /api/admin/restaurants
 * @desc    Add a new restaurant to the database manually.
 * @access  Private (Admin Only)
 * @body    {string} name - Name of the restaurant (required)
 * @body    {string} camis - Unique CAMIS identifier (required)
 * @body    {string} boro - Borough where the restaurant is located (optional)
 * @body    {string} cuisine - Type of cuisine served (optional)
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
        
        await db.collection('restaurants').insertOne({
            name: name.trim(),
            camis: camis.trim(),
            boro: boro?.trim() || "N/A",
            cuisine: cuisine?.trim() || "N/A",
            lastUpdated: new Date(),
            manualEntry: true
        });

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
 * @route   DELETE /api/admin/restaurants/:camis
 * @desc    Remove a restaurant from the database.
 * @access  Private (Admin Only)
 * @param   {string} camis - Unique CAMIS identifier (required)
 * @body    {string} returnUrl - URL to redirect to after deletion (optional)
 */
router.delete('/restaurants/:camis', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const db = getdb();
        const camis = req.params.camis;
        const { returnUrl } = req.body;
        
        const restaurant = await db.collection('restaurants').findOne({ camis });
        if (!restaurant) return res.redirect('/api/admin/dashboard?error=notfound');

        await db.collection('restaurants').deleteOne({ camis });

        await createAuditLog(
            req.session.member.userId, 
            'DELETE_RESTAURANT', 
            camis, 
            `Removed restaurant: ${restaurant.name}`
        );

        return returnUrl ? res.redirect(returnUrl) : res.redirect('/api/admin/dashboard?success=removed');
    } catch (e) {
        next(e);
    }
});

/**
 * @route   DELETE /api/admin/reviews/:id
 * @desc    Force remove a review from the database. Supports redirecting back to source.
 * @access  Private (Admin Only)
 * @param   {string} id - Unique ObjectId for reviews to be deleted (required)
 * @body    {string} returnUrl - URL to redirect to after deletion (optional)
 */
router.delete('/reviews/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const db = getdb();
        const reviewId = req.params.id;
        const { returnUrl } = req.body;

        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).redirect('/api/admin/dashboard?error=invalid_id');
        }

        const result = await db.collection('reviews').deleteOne({ 
            _id: new ObjectId(reviewId) 
        });

        if (result.deletedCount === 0) {
            return res.status(404).redirect('/api/admin/dashboard?error=review_not_found');
        }

        await createAuditLog(
            req.session.member.userId, 
            'DELETE_REVIEW', 
            reviewId, 
            "Admin force-removed reported content."
        );
        
        return returnUrl ? res.redirect(returnUrl) : res.redirect('/api/admin/dashboard?success=review_deleted'); 

    } catch (e) {
        next(e);
    }
});

/**
 * @route   DELETE /api/admin/posts/:id
 * @desc    Force remove a community pulse post. Supports redirecting back to source.
 * @access  Private (Admin Only)
 * @param   {string} id - Unique ObjectId of the post to be deleted (required)
 * @body    {string} returnUrl - URL to redirect to after deletion (optional)
 */
router.delete('/posts/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const db = getdb();
        const postId = req.params.id;
        const { returnUrl } = req.body;

        if (!ObjectId.isValid(postId)) return res.redirect('/api/admin/dashboard?error=invalid_id');

        const result = await db.collection('posts').deleteOne({ _id: new ObjectId(postId) });

        if (result.deletedCount > 0) {
            await createAuditLog(
                req.session.member.userId, 
                'DELETE_POST', 
                postId, 
                "Admin removed reported post."
            );
        }

        return returnUrl ? res.redirect(returnUrl) : res.redirect('/api/admin/dashboard?success=post_deleted');
    } catch (e) {
        next(e);
    }
});

/**
 * @route   GET /api/admin/posts
 * @desc    Get all posts in the system for moderation with pagination support.
 * @access  Private (Admin Only)
 * @query   {string} lastId - ID of the last post for cursor-based pagination (optional)
 * @query   {number} limit - Number of posts to return (default: 20)
 * @returns {JSON} List of posts with pagination info.
 */
router.get('/posts', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const lastId = req.query.lastId || null;
        const limit = parseInt(req.query.limit) || 20;

        const posts = await getAllPostsAdmin(lastId, limit);

        res.json({
            success: true, 
            count: posts.length,
            data: posts
        });
    } catch (e) {
        next(e);
    }
});

/**
 * @route   GET /api/admin/search/restaurants
 * @desc    Manual search for restaurants by Name or CAMIS.
 * @access  Private (Admin Only)
 * @query   {string} query - Search keyword (required)
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
 * @desc    Manual search for reviews by keyword.
 * @access  Private (Admin Only)
 * @query   {string} query - Search keyword (required)
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

/**
 * @route   GET /api/admin/search/posts
 * @desc    Manual search for community pulse posts for moderation.
 * @access  Private (Admin Only)
 * @query   {string} query - Search keyword (required)
 */
router.get('/search/posts', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) return res.redirect('/api/admin/dashboard');

        const results = await searchPostsAdmin(query);

        res.render('admin/search-results', {
            title: "BiteCheck | Post Search",
            searchType: "Posts",
            query,
            results,
            isPostSearch: true,
            user: req.session.member
        });
    } catch (e) {
        next(e);
    }
});

export default router;