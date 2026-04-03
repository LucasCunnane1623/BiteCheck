import { Router } from "express";
const router = Router();
//this router is purely for displaying html 

/**
 * @route GET /home
 * @desc Displays the landing page HTML 
 * @access Public (all users)
 * @body none 
 * @returns none
 * @example
 * GET /home
 */
router.get('/', async (req, res)=>{
    return res.render('landing',{
        title: "BiteCheck: Welcome",
        header: "Welcome To Bitecheck!",
        body: "<p><b>BiteCheck</b> is a public health–focused dining transparency platform designed to provide New Yorkers and visitors with reliable access to restaurant inspection data. By integrating directly with official restaurant inspection databases, BiteCheck delivers up-to-date information on health and safety compliance across the city. Our platform empowers users to make informed dining decisions by clearly presenting health inspection results, including documented violations related to food preparation practices, sanitation standards, and workplace hygiene. Through an intuitive and user-friendly interface, diners can easily review a restaurant’s inspection history before choosing where to eat. BiteCheck’s mission is to elevate food safety to the same level of importance as cuisine, price, and location. By increasing transparency and accessibility of public health data, we aim to help reduce the risk of food-borne illness, promote higher standards within the restaurant industry, and foster a safer dining environment for both residents and tourists.</p>"
    });
});

export default router;