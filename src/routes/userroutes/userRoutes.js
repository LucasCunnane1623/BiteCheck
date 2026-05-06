import { Router } from 'express';
import { getUserProfile, updateUserInfo } from '../../services/userService.js';
import { authenticate,redirectToLanding } from '../../middleware/auth.js';
import validation from '../../helpers.js';
import multer from 'multer';

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
});

router.route('/profile/edit')
.get(authenticate, async (req,res,next)=>{
    //this renders the edit profile page which loads the form in the handlebars 
    try{
        const userId = req.session.member.userId; // Extract userId from the authenticated token
        if (!userId){
            return res.status(400).json({ error: "invalid User Id"})
        }
        const profile = await getUserProfile(userId);

        if (!profile){
            return res.status(404).json({ error: "user not found"})
        }
        res.status(200).render("profile_edit",{
            title : "BiteCheck: Edit Profile",
            username : profile.username,
            firstName : profile.firstName, //user starts without a first or last name, but can update it 
            lastName : profile.lastName, //user starts without a first or last name, but can update it 
            email : profile.email,
            age : profile.age,
            profilePhoto : profile.profilePhoto,
            favRestaurants : profile.favRestaurants,
            status : profile.status,
            appSearchRadiusMeters : profile.appSearchRadiusMeters
        });
    } catch (e){    
        next(e);
    }
}).post(authenticate,upload.single("profilePhoto"), async (req,res,next)=>{
//funcitonality to update user profile info, not currently used but may be in the future.

    try{

        const userId = req.session.member.userId;
        const existingProfile = await getUserProfile(userId);
        let photoPath = existingProfile.profilePhoto;
        let { firstName, lastName, status, appSearchRadiusMeters} = req.body;
        if (appSearchRadiusMeters){
            appSearchRadiusMeters = parseInt(appSearchRadiusMeters);
            if (!appSearchRadiusMeters || isNaN(appSearchRadiusMeters) || appSearchRadiusMeters < 50 || appSearchRadiusMeters > 35000){
                return res.status(400).json({ error: "Invalid search radius. Must be a number between 50 and 35000 meters." });
            }
        }else{
            appSearchRadiusMeters = existingProfile.appSearchRadiusMeters; //if the user didn't provide a new search radius, keep the existing one
        }

        
        try {
            if(firstName){
                firstName = validation.checkString(firstName,"first name");
            }else{
                firstName = existingProfile.firstName; //if the user didn't provide a new first name, keep the existing one
            }
            if(lastName){ 
                lastName= validation.checkString(lastName,"last name");
             }else{
                lastName = existingProfile.lastName; //if the user didn't provide a new last name, keep the existing one
             }
            if(status){
                status = validation.checkString(status,"status");
            } else{
                status = existingProfile.status; //if the user didn't provide a new status, keep the existing one
            }
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        //update the user profile photo if a new one was uploaded
        if (req.file){//filename send in the request (seperate from the body) if a new photo was uploaded, if not we just keep the existing photo path
            photoPath = `/uploads/profilePhotos/${req.file.filename}`;
        }
    //technically this is a PATCH operation but since we're only updating one resource (the user profile) and not partially updating multiple resources, using POST is acceptable here.
        const updatedProfile = await updateUserInfo(userId, { 
            firstName,
            lastName,
            status,
            appSearchRadiusMeters,
            profilePhoto : photoPath  //only update the photoPath if a new photo was uploaded, otherwise keep the existing path
        });

        if (!updatedProfile){
            return res.status(404).json({ error: "user not found" });
        }

        res.status(200).redirect("/api/users/profile");
    } catch (e){
        next(e);
    }
});

export default router;
