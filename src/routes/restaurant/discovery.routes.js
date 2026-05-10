import express from "express";
import { validateLocation } from '../../middleware/validator.js';
import { getUniversalSuggestions, searchRestaurants } from '../../services/restaurantService.js';
import { getStatusColor } from '../../services/hygiene.js';
import { getdb } from '../../database/db.js';
import settings from '../../config/settings.js';

const router = express.Router()

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
 * @route GET /api/restaurants
 * @desc Returns all restaurants with coords, score, and color for the map
 * @access Public
 */
router.get('/', async (req, res, next) => {
    try {
        const db = getdb();
        const restaurants = await db.collection(settings.mongo.collections.restaurants)
            .find(
                { 
                    color: { $exists: true },
                    $or: [
                        { 'location.coordinates': { $exists: true } },
                        { 'coords.lat': { $exists: true } }
                    ]
                }, 
                { 
                    projection: { 
                        name: 1, 
                        location: 1,
                        coords: 1,
                        score: 1, 
                        color: 1 
                    } 
                }
            )
            .limit(200)
            .toArray();

        res.status(200).json(restaurants);
    } catch (e) {
        next(e);
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

export default router
