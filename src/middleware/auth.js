import { ObjectId } from 'mongodb';
import { getdb } from '../database/db.js';
import jwt from 'jsonwebtoken';



export const redirectToLanding = (req, res, next) => {
     if (!req.session.member){//if the user does not have a cookie yet and tries to access /home , redirect to landing 
        return res.redirect('/');
     }   
     next();
}

//When in doubt, use this method as middleware to send a user to login
export const redirectToLogin = (req, res, next) => {
        if (!req.session.member){//if the user tries to access any routes that they must be signed in to use, use this as middleware
            return res.redirect('/login');
        }
     next();
}



// // #3.) GET /register middleware 
// app.use('/register', (req, res, next) => {
//      if(req.method !== "GET"){ //must be a GET method for this check to run
//           next();
//           return;
//      }
//      if (req.session.member){
//           if(req.session.member.membershipLevel === "manager"){
//                 return res.redirect('/manager');
//           }else if(req.session.member.membershipLevel === "member"){
//                return res.redirect('/member');
//           }
//      }   
//      next();
// });
//This method just outputs all actions to track users pages (could send to PostHog in the future?)
export const serverdebug = (req,res,next)=>{
    const dateString = new Date().toUTCString();
    const reqMethodString = req.method;
    const reqPathString = req.path;
    let authString = req.session.member ?  "(Logged In)":"(Not Logged In)" ;
    let outputString = `[${dateString}]: ${reqMethodString} ${reqPathString} ${authString}`;
    console.log(outputString);
    next();
}


export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!req.session.member){//if the user tries to access any routes that they must be signed in to use, use this as middleware 
        return res.redirect('/signin');
    }   
    

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Access Denied, no token provided"})
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "syFzeOTlrfAiLN3g6OpxmH1fGFBM7PlmF2b87L7TMX7");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });           
    };
};


export const checkReviewOwnership = async (req, res, next) => {
    const { id } = req.params;
    const {userId} = req.body;

    try {
        const db = await getdb();
        const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });

        if (!review) {
            return res.status(404).json({error:  "Review not found"});
        }

        if (review.userId !== userId){
            return res.status(403).json({error: "Unauthorized to modify this review"});
        }
        next(); // If ownership is verified, proceed to the next middleware or route handler
    } catch (err) {
        res.status(500).json({error: "Failed to verify review ownership"});
    }
}