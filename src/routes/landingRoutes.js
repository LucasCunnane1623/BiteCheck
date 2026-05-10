import { Router } from "express";
import {redirectToLanding, authenticate} from "../middleware/auth.js"
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
export default router;