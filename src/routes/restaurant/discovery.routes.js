import express from "express";
import { validateLocation } from '../../middleware/validator.js';
import { 
    getUniversalSuggestions, 
    searchRestaurants, 
    synthesizeRestaurantData 
} from '../../services/restaurantService.js';
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
            color: { $exists: true },
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
        
        const detailedRestaurants = await Promise.all(restaurants.map(async (r) => {
            const reviews = await db.collection('reviews').find({ camis: r.camis }).toArray();
            const reports = await db.collection('posts').find({ 
                businessName: r.name, 
                isFlagged: true 
            }).toArray();

            const synthesized = synthesizeRestaurantData(r, reviews, reports);

            return {
                ...synthesized,
                safetyStatus: synthesized.safetyStatus || getStatusColor(r.inspections || []),
                topRisk: r.inspections?.find(i => i.isCritical)?.potentialIllness || "No major risks"
            };
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
 * */

router.get('/suggest', async (req, res, next) => {
    try{
        const {q} = req.query;
        if (!q || q.length < 2 || q.trim().length === 0){
            return res.json({success: true, data: []})
        }
        const rawResults = await getUniversalSuggestions(q)
        const suggestions = rawResults[0]?.suggestions || [];
        const detailedSuggestions = suggestions.map(item => {
            if (item.type === 'restaurant'){
                return {
                    ...item,
                    safetyStatus: getStatusColor(item.inspections||[])
                };
            }
            return item;
        });

        res.status(200).json({
            success: true, 
            data: detailedSuggestions
        });
    } catch (e){
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
 * Renders the restaurant_search view with synthesized safety data.
 * @access Public
 * @query {string} q - Search query (required)
 * @returns {View} Renders restaurant_search.handlebars with search results.
 * @example
 * GET /api/restaurants/search?q=pizza
 */

router.get('/search', async(req, res, next)=>{
    try{
        const query  = req.query.q; 
        
        if (!query || query.trim().length === 0){
            // Instead of JSON, we render the page with an error state
            return res.render('restaurant_search', { 
                error: "Search query must be at least 2 characters long",
                user: req.session.member 
            });
        };

        const db = getdb();
        const results = await searchRestaurants(query);

        // Map raw results through the synthesizer to get violation tags and trend data
        const processedData = await Promise.all(results.map(async (item) => {
            const reviews = await db.collection('reviews').find({ camis: item.camis }).toArray();
            const reports = await db.collection('posts').find({ 
                businessName: item.name, 
                isFlagged: true 
            }).toArray();

            return synthesizeRestaurantData(item, reviews, reports);
        }));

        // Render the Handlebars view instead of sending JSON
        res.render('restaurant_search', {
            title: `BiteCheck | Search: ${query}`,
            results: processedData,
            query: query,
            hasQuery: true,
            resultCount: processedData.length,
            user: req.session.member // Pass the user session for the header
        });

    } catch (e) {
        next(e)
    };
});

export default router