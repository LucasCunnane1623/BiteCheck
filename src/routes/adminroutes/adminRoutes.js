import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorizeAdmin } from '../../middleware/admin.js';
import { getdb } from '../../database/db.js';

const router = Router();


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
    try{
        const {name, camis, boro, cuisine} = req.body;
        // validation for name and camis id
        if (!name || !camis){
            return res.status(400).json({error: "Name and CAMIS are required fields"})
        }

        const db = getdb();

        // check for duplicates
        const exitingRestaurant = await db.collection('restaurants').findOne({camis: camis});
        if (exitingRestaurant){
            return res.status(409).json({error: "A restaurant with this CAMIS already exists"})
        }
        
       // insert the new restaurant into the database, adding a lastUpdated timestamp
        const result = await db.collection('restaurants').insertOne({
            ...req.body,
            lastUpdated: new Date()
    
        })
        // respond with the id of the newly created restaurant
        res.status(201).json({
            success: true, 
            message: "Restaurant added successfully",
            id: result.insertedId
        })
    } catch (e) {
        next(e)
    }
})

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
    try{
        const db = getdb();
        // get camis from the req
        const camis = req.params.camis;
        // delete the camis from the database
        const result = await db.collection('restaurants').deleteOne({camis: camis});

        if (result.deletedCount === 0){
            return res.status(404).json({error: "Restaurant not found"})
        }
        res.json({
            success: true, 
            message: `Restaurant with ${camis} removed by admin`
        })
    } catch (e) {
        next(e)
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


export default router;
