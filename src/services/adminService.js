import { getdb } from '../database/db.js';
import { ObjectId } from 'mongodb';

/**
 * Admin Dashboard Aggregator
 * Fetches platform metrics, flagged content, and system history in parallel.
 */
export const getAdminDashboardData = async () => {
    const db = getdb();

    // 1. Execute all queries in parallel for maximum performance
    const [userCount, reviewCount, reportedReviews, recentLogs] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('reviews').countDocuments(),
        
        // 2. Moderation Queue: prioritized by report count, then recency
        db.collection('reviews').find()
          .sort({ reports: -1, createdAt: -1 })
          .limit(10)
          .toArray(),

        // 3. Accountability Trail: Fetch the 10 most recent admin actions
        db.collection('admin_logs').find()
          .sort({ timestamp: -1 }) 
          .limit(10)
          .toArray()
    ]);

    // 4. Return a unified object for Handlebars to render
    return {
        stats: {
            users: userCount,
            reviews: reviewCount,
            syncStatus: "Active", 
            lastSync: new Date().toLocaleTimeString()
        },
        moderationQueue: reportedReviews,
        systemLogs: recentLogs // This powers your accountability table
    };
};

/**
 * Purpose: To create a permanent record of administrative actions for security and accountability
 * @param {*} adminId : who did it
 * @param {*} action : what was done (delete, post, etc)
 * @param {*} targetId : the id of the item affected
 * @param {*} details  : when it happened
 * 
 */
export const createAuditLog = async (adminId, action, targetId, details) => {
    const db = getdb();
    await db.collection('admin_logs').insertOne({
        adminId,
        action,
        targetId,
        details,
        timestamp: new Date()
    });
};

/**
 * Global Restaurant Search
 * Searches by partial name (case-insensitive) OR exact CAMIS match.
 */
export const searchRestaurantsAdmin = async (query) => {
    const db = getdb();
    return await db.collection('restaurants').find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { camis: query }
        ]
    }).limit(50).toArray(); // Limit to 50 for performance
};

/**
 * Global Review Search
 * Searches for keywords within review comments.
 */
export const searchReviewsAdmin = async (query) => {
    const db = getdb();
    return await db.collection('reviews').find({
        comment: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 }).limit(50).toArray();
};


/**
 * Retrieves a paginated list of all reviews for the admin panel.
 * Uses cursor-based pagination for high performance.
 * * @param {string} lastId - The ID of the last item from the previous batch.
 * @param {number} limit - Number of records to fetch.
 */
export const getAllPostsAdmin = async (lastId, limit = 20) => {
    const db = getdb();
    let query = {};

    // If lastId is provided, only fetch items created BEFORE this ID
    // (Assuming we want newest items first)
    if (lastId && ObjectId.isValid(lastId)) {
        query = { _id: { $lt: new ObjectId(lastId) } };
    }

    return await db.collection('reviews')
        .find(query)
        .sort({ _id: -1 }) // Sort by newest first
        .limit(limit)
        .toArray();
};