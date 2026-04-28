import express from 'express';
import { registerUser, loginUser } from '../../services/authService.js';
import xss from 'xss';
import validation from "../../helpers.js";
const router = express.Router();


router.route('/register')
/**
 * @route GET /api/auth/register   
 * @desc Register Page 
 * @access Non Authenticated (signed in) users
 */
.get(async (req, res, next) => {
    //if the user is already logged in, they should never be allowed to see the signin or register page 
    if(req.session.member){
        return res.status(302).redirect('/home');
    }
    return res.status(200).render('register',
        {
            title: "BiteCheck: Register"
        }
    );
})
/**
 * @route POST /api/auth/register   
 * @desc Register a new user
 * @access Public
 * @body {string} email - User's email address (required)
 * @body {string} username - Desired username (required)
 * @body {string} password - User's password (required)
 * @body {number} age - User's age (optional, must be 13 or older to register)
 * @returns {Object} Confirmation message with the ID of the newly registered user.
 */
.post( async (req, res, next) => {

    //Input Sanitization 
    try {
        let { email,firstName,lastName, username, password, dateOfBirth } = req.body;
        //trim all inputs and check for any hidden scripts in input 
        email = email?.trim();
        username = username?.trim();
        password = password?.trim();
        console.log(`email:${email}`);
        console.log(`password:${password}`);
        console.log(`email:${email}`);
        if(!email || !password || !username){
            return res.status(400).json({error: "All fields are required"});
        }

        /*CHECK HERE 
        1. age is above 13
        2. 
        CHECK IN DATE FUNCTION
        1. user with provided email/username does not already exist in the db (if either exists, throw a 404)
        2. 
        */
        
        //data method call (in authService)
        try {
            const userId = await registerUser(email, password, username);
        } catch (error) {
            return res.status(500).json({
                error: `Server Error. Unable to register user. ${error}`
            });
        }

        //######### TODO: CREATE SESSION MEMBER COOKIE HERE #####
        
        
        //############# END TODO ######### 

        //redirect to login if the fields look good  
        return res.status(201).redirect('/api/auth/login');
    } catch (err) {
        next(err);
    }
});

/**
 * @route GET /api/auth/login   
 * @desc Display the Sign in Page
 * @access All Non Authenticated Users
 * @renders login 
 */
router.route('/login')
.get(async (req, res, next) =>{
    //if the user is already logged in, they should never be allowed to see the signin or register page 
    if(req.session.member){
        return res.redirect('/home');
    }
    return res.render('login',
        {
            title: "BiteCheck: Login"
        } 
    );
})

/**
 * @route POST /api/auth/login
 * @desc Authenticate a user and return a JWT token
 * @access Public
 * @body {string} email - Users email address (required)
 * @body {string} password - Users password (required)
 * @returns {Object} Confirmation message with the JWT token and user information.
 */
.post( async (req, res, next) => {
    try {
        const { email, password} = req.body;
        email = xss(email.trim());
        password = xss(password.trim());

        if (!email || !password){
            return res.status(400).json({error: "Email and password required"})
        };

        try {
            const result = await loginUser(email, password);
            const {token, username, isAdmin} = result
        } catch (error) {
            return res.status(500).json({
                error: "Server Error. Unable to login User"
            });
        }
        res.status(200)
            .json({
            message: "Login Successful",
            token,
            username,
            isAdmin
        }); 
        
    } catch (err) {
        next(err);
    }
});

export default router;


