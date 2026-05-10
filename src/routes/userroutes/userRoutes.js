import { Router } from 'express';
import { getUserProfile, updateUserInfo } from '../../services/userService.js';
import { authenticate,redirectToLanding } from '../../middleware/auth.js';

const router = Router();

//https://www.npmjs.com/package/multer instead of relying on amazon s3 buckets for external storage of pictures, we can use multer to handle file uploads and store them locally on the server.
//This is a simpler solution for development and testing purposes, and can be easily switched to a cloud storage solution in the future if needed.
//creating a storage object for multer to specify where to store uploaded files and how to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/uploads/profilePhotos");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer(
    { 
        storage: storage, //specifying the storage object we just created
    }
);

/**
 * @route GET /api/users/profile
 * @desc Get the authenticated user's profile information, including their posts and reviews.
 * @access Private (Authenticated users only)
 * @returns {Object} User profile data with recent posts and reviews.
 * @example
 * GET /api/users/profile
 */

router.get('/profile', authenticate, async (req, res, next) => {
    try{
        const userId = req.session.member.userId; // Extract userId from the authenticated token
        if (!userId){
            return res.status(400).json({ error: "invalid User Id"})
        }
        const profile = await getUserProfile(userId);

        if (!profile){
            return res.status(404).json({ error: "user not found"})
        }
        res.status(200).render("profile",{
            title : "BiteCheck: Profile",
            username : profile.username,
            firstName : profile.firstName, //user starts without a first or last name, but can update it 
            lastName : profile.lastName, //user starts without a first or last name, but can update it 
            email : profile.email,
            profilePhoto : profile.profilePhoto,
            favRestaurants : profile.favRestaurants,
            status : profile.status,
            appSearchRadiusMeters : profile.appSearchRadiusMeters,
            age : profile.age,
            recentPosts : profile.recentPosts,
            recentReviews : profile.recentReviews
        });
    } catch (e){
        next(e);
    }
})

export default router;
