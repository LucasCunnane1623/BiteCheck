import express from 'express';
import { ObjectId } from 'mongodb';
import { getdb } from '../database/db.js';
import settings from '../config/settings.js';
import { getStatusColor } from '../services/hygiene.js';
import { validateLocation } from '../middleware/validator.js';
import { authenticate, checkReviewOwnership } from '../middleware/auth.js';
import { addReview, getRestaurantReviews } from '../services/reviewService.js';
import { searchRestaurants } from '../services/restaurantService.js';

const router = express.Router();

//GET /api/restaurants/near-----Automatically finds restaurants within a radius of the user.

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

//GET /api/restaurants/:id/risk-profile----Detailed medical risk analysis for a specific restaurant.

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

//POST /api/restaurants/reviews-----Submit a consumer hygiene sighting.

router.post('/reviews', authenticate, async (req, res, next) => {
    try {
        const result = await addReview({ ...req.body, userId: req.user.userId });
        res.status(201).json({ message: "Review Posted!", id: result.insertedId });
    } catch (err) {
        next(err);
    }
});

//GET /api/restaurants/:camis/reviews-----Fetch all community reviews for one location.

router.get('/:camis/reviews', async (req, res, next) => {
    try {
        const reviews = await getRestaurantReviews(req.params.camis);
        res.json(reviews);  
    } catch (err) {
        next(err);
    }
});

//PATCH /api/restaurants/reviews/:id-----Edit an existing review (Owner only).

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

// DELETE /api/restaurants/reviews/:id   Remove a review (Owner only).

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


export default router;