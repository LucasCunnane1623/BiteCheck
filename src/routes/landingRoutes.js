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
        title: "Bitecheck: Welcome",
        header: "Welcome To Bitecheck",
        body: "<p>Yo gang this is where the description is</p>"
    });
});

export default router;