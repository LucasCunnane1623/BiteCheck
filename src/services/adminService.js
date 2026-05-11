import { ObjectId } from "mongodb";
import { getdb } from "../database/db.js";

/**
 * Admin Dashboard Aggregator
 * Fetches platform metrics, flagged content, and system history in parallel.
 * Includes safe filtering for reported items to avoid schema-type collisions.
 */
export const getAdminDashboardData = async () => {
    const db = getdb();

    // 1. Fetch Stats in parallel for efficiency
    const [userCount, reviewCount, postCount] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('reviews').countDocuments(),
        db.collection('posts').countDocuments()
    ]);

    // 2. Fetch Moderation Queues (Reported items only)
    // We use a robust filter to ensure we only pick up items with actual report data
    const reportedReviews = await db.collection('reviews')
        .find({ 
            $or: [
                { reports: { $exists: true, $not: { $size: 0 } } },
                { reports: { $gt: 0 } }
            ] 
        })
        .toArray();

    const reportedPosts = await db.collection('posts')
        .find({ isFlagged: true })
        .toArray();

    // 3. Fetch Audit Logs from the consolidated 'admin_logs' collection
    const logs = await db.collection('admin_logs')
        .find()
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

    return {
        stats: {
            users: userCount,
            reviews: reviewCount,
            posts: postCount,
            lastSync: new Date().toLocaleDateString()
        },
        moderationQueue: {
            reviews: reportedReviews,
            posts: reportedPosts
        },
        systemLogs: logs
    };
};

/**
 * Audit Logging
 * Creates a permanent record of administrative actions.
 * @param {string} adminId - The ID of the admin performing the action.
 * @param {string} action - The type of action (e.g., 'DELETE_POST').
 * @param {string} targetId - The ID of the document affected.
 * @param {string} details - Human-readable description of the action.
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
 * Performs a case-insensitive regex search on name and an exact match on CAMIS.
 */
export const searchRestaurantsAdmin = async (query) => {
    const db = getdb();
    const cleanQuery = query.trim();
    return await db.collection('restaurants').find({
        $or: [
            { name: { $regex: cleanQuery, $options: 'i' } },
            { camis: cleanQuery }
        ]
    }).limit(50).toArray();
};

/**
 * Global Review Search
 * Searches for keywords within user review comments.
 */
export const searchReviewsAdmin = async (query) => {
    const db = getdb();
    return await db.collection('reviews').find({
        comment: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 }).limit(50).toArray();
};

/**
 * Global Post Search
 * Searches through Community Pulse posts by business name, title, or content body.
 */
export const searchPostsAdmin = async (query) => {
    const db = getdb();
    return await db.collection('posts').find({
        $or: [
            { businessName: { $regex: query, $options: 'i' } },
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
        ]
    }).sort({ createdOn: -1 }).limit(50).toArray();
};

/**
 * Paginated Retrieval
 * Fetches community posts using cursor-based pagination.
 */
export const getAllPostsAdmin = async (lastId = null, limit = 20) => {
    const db = getdb();
    let query = {};

    if (lastId && ObjectId.isValid(lastId)) {
        query = { _id: { $lt: new ObjectId(lastId) } };
    }

    return await db.collection('posts')
        .find(query)
        .sort({ _id: -1 })
        .limit(limit)
        .toArray();
};

/**
 * Safe Aggregation for Top Reported Reviews
 * Handles cases where 'reports' might be an array OR a legacy integer.
 */
export const getTopReportedReviews = async (limit = 20) => {
    const db = getdb();
    return await db.collection('reviews').aggregate([
        { 
            $addFields: { 
                reportCount: { 
                    $cond: {
                        if: { $isArray: "$reports" },
                        then: { $size: "$reports" },
                        else: { $ifNull: ["$reports", 0] }
                    }
                } 
            } 
        },
        { $match: { reportCount: { $gt: 0 } } }, 
        { $sort: { reportCount: -1 } },
        { $limit: limit }
    ]).toArray();
};

/**
 * Safe Aggregation for Top Reported Community Posts
 * Uses conditional logic to safely calculate the size of the reports field.
 */
export const getTopReportedPosts = async (limit = 20) => {
    const db = getdb();
    return await db.collection('posts').aggregate([
        { $match: { isFlagged: true } },
        { 
            $addFields: { 
                reportCount: { 
                    $cond: {
                        if: { $isArray: "$reports" },
                        then: { $size: "$reports" },
                        else: { $ifNull: ["$reports", 0] }
                    }
                } 
            } 
        },
        { $sort: { reportCount: -1 } },
        { $limit: limit }
    ]).toArray();
};