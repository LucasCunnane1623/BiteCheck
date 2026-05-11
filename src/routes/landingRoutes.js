import { Router } from "express";
import {redirectToLanding, authenticate} from "../middleware/auth.js";
import { searchRestaurants, getUniversalSuggestions } from "../services/restaurantService.js";
import { getStatusColor } from "../services/hygiene.js";
import { getUserProfile } from "../services/userService.js";
import settings from "../config/settings.js";
const router = Router();

/**
 * @route GET /
 * @desc Displays the landing page HTML 
 * @access Public (all users)
 * @body none 
 * @returns none
 * @example
 * GET /
 */


router.route('/')
.get(async (req, res)=>{
    return res.render('landing',{
        title: "BiteCheck: Welcome",
        body: "<p><b>BiteCheck</b> is a public health–focused dining transparency platform designed to provide New Yorkers and visitors with reliable access to restaurant inspection data. By integrating directly with official restaurant inspection databases, BiteCheck delivers up-to-date information on health and safety compliance across the city. Our platform empowers users to make informed dining decisions by clearly presenting health inspection results, including documented violations related to food preparation practices, sanitation standards, and workplace hygiene. Through an intuitive and user-friendly interface, diners can easily review a restaurant’s inspection history before choosing where to eat. BiteCheck’s mission is to elevate food safety to the same level of importance as cuisine, price, and location. By increasing transparency and accessibility of public health data, we aim to help reduce the risk of food-borne illness, promote higher standards within the restaurant industry, and foster a safer dining environment for both residents and tourists.</p>"
    });
});


/**
 * @route GET /home
 * @desc Displays the home page HTML 
 * @access Public (all users)
 * @body none 
 * @returns none
 * @example
 * GET /home
 */
router.route('/home',authenticate)
.get(
async (req, res)=>{
    return res.render('home',{
        title: "BiteCheck: Home",
        body: "This is the body for the homepage",
        showProfileButton: true,
        showFriendsButton: true,
        showCommPulseButton : true,
        user: req.session.member
    });
});



/**
 * @route GET /restaurants/search
 * @desc Renders a restaurant search page using the existing restaurant search service
 * @access Private (signed-in users)
 * @query {string} q - Search query entered by the user
 */
router.route('/restaurants/search', authenticate)
.get(async (req, res, next) => {
    try {
        const query = req.query.q ? req.query.q.trim() : "";
        let results = [];
        let error = null;

        if (query.length > 0) {
            try {
                const rawResults = await searchRestaurants(query);

                results = rawResults.map((restaurant) => ({
                    ...restaurant,
                    safetyStatus: getStatusColor(restaurant.inspections || [])
                }));
            } catch (e) {
                error = "Restaurant search is currently unavailable. The backend may still need the MongoDB text index configured.";
            }
        }

        return res.status(200).render("restaurant_search", {
            title: "BiteCheck: Restaurant Search",
            query,
            hasQuery: query.length > 0,
            results,
            resultCount: results.length,
            error,
            showProfileButton: true,
            showFriendsButton: true,
            showCommPulseButton: true,
            user: req.session.member
        });
    } catch (e) {
        next(e);
    }
});

/**
 * @route GET /restaurants/suggestions
 * @desc Renders a restaurant suggestions page using the existing suggestion service
 * @access Private (signed-in users)
 * @query {string} q - Suggestion query entered by the user
 */
router.route('/restaurants/suggestions', authenticate)
.get(async (req, res, next) => {
    try {
        const query = req.query.q ? req.query.q.trim() : "";
        let suggestions = [];
        let favoriteSuggestions = [];
        let favoriteRestaurants = [];
        let error = null;

        if (req.session.member && req.session.member.userId) {
            try {
                const profile = await getUserProfile(req.session.member.userId);
                favoriteRestaurants = profile?.favRestaurants || [];

                if (favoriteRestaurants.length > 0) {
                    const favoriteQuery = favoriteRestaurants[0];
                    const rawFavoriteResults = await getUniversalSuggestions(favoriteQuery);
                    const rawFavoriteSuggestions = rawFavoriteResults[0]?.suggestions || [];

                    favoriteSuggestions = rawFavoriteSuggestions.map((item) => {
                        if (item.type === "restaurant") {
                            return {
                                ...item,
                                safetyStatus: getStatusColor(item.inspections || [])
                            };
                        }

                        return item;
                    });
                }
            } catch (e) {
                favoriteSuggestions = [];
            }
        }

        if (query.length > 0) {
            try {
                const rawResults = await getUniversalSuggestions(query);
                const rawSuggestions = rawResults[0]?.suggestions || [];

                suggestions = rawSuggestions.map((item) => {
                    if (item.type === "restaurant") {
                        return {
                            ...item,
                            safetyStatus: getStatusColor(item.inspections || [])
                        };
                    }

                    return item;
                });
            } catch (e) {
                error = "Restaurant suggestions are currently unavailable.";
            }
        }

        return res.status(200).render("restaurant_suggestions", {
            title: "BiteCheck: Restaurant Suggestions",
            query,
            hasQuery: query.length > 0,
            suggestions,
            suggestionCount: suggestions.length,
            favoriteRestaurants,
            favoriteSuggestions,
            hasFavorites: favoriteRestaurants.length > 0,
            error,
            showProfileButton: true,
            showFriendsButton: true,
            showCommPulseButton: true,
            user: req.session.member
        });
    } catch (e) {
        next(e);
    }
});




/**
 * @route GET /map
 * @desc Displays the interactive map page showing restaurant locations and health data
 * @access Private (authenticated users only)
 * @body none 
 * @returns none (renders map.hbs)
 * @example
 * GET /map
 */
router.route('/map')
.get(authenticate, async (req, res) => {
    return res.render('map', {
        title: 'BiteCheck: Map',
        isMapPage: true,
        googleMapsApiKey: settings.googleMapsApiKey,
        user: req.session.member
    });
});

export default router;