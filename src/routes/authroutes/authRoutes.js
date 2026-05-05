import express from 'express';
import xss from 'xss';
import { isBefore, parse } from "date-fns";


import { registerUser, loginUser } from '../../services/authService.js';
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
        lastName = lastName?.trim();
        firstName = firstName?.trim();
        dateOfBirth = dateOfBirth?.trim();
        

        console.log(`${email},${username},${password},${lastName},${firstName},${dateOfBirth}`);


        //checking for existence of all body attributes
        if(!email || !password || !username || !dateOfBirth || !firstName || !lastName){
            return res.status(400).render("error",{
                statusCode :400,
                error: "All fields are required",
                lastPageRoute: "/api/auth/register"
            });
        }

        //checking that all body attributes are valid strings
        try {
            email = validation.checkString(email,"email");
            firstName = validation.checkString(firstName,"first name");
            lastName = validation.checkString(lastName,"last name");
            username = validation.checkString(username,"username");
            password = validation.checkString(password,"password");
            dateOfBirth = validation.checkString(dateOfBirth, "date of birth");
        } catch (error) {
             return res.status(400).render("error",{
                statusCode :400,
                error: `${error}`,
                lastPageRoute: "/api/auth/register"
            });
        }
       
        //checking that the users date of birth is formatted correctly 
        const today = new Date();
        const DOB = parse(dateOfBirth,"yyyy-MM-dd", new Date());
        const MIN_USER_AGE =13
        if (isNaN(DOB.getTime())) {
            return res.status(400).render("error",{
                statusCode :400,
                error: "Date of Birth Formatted Incorrectly",
                lastPageRoute: "/api/auth/register"
            });
        }

        //checkng that the user is old enough to register (13+)
        
        const minDate = new Date(today.getFullYear() - MIN_USER_AGE,today.getMonth(),today.getDate());
        if(isBefore(minDate,DOB)){
            return res.status(400).render("error",{
                statusCode :400,
                error: "User must be 13 years or older to register!",
                lastPageRoute: "/api/auth/register"
            });
        }


        //data method call (in authService)
        try {
            const userId = await registerUser(email, password, username);
        } catch (error) {
            return res.status(409).render("error",{
                statusCode :409,
                error: ` Unable to register user. ${error}`,
                lastPageRoute: "/api/auth/register"
            });
        }



        //redirect to login if the fields look good  
        req.session.message = "User Registered Successfully!";
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
        let { email, password} = req.body;
        email = xss(email.trim());
        password = xss(password.trim());

        if (!email || !password){
            return res.status(400).render("error",{
                statusCode :400,
                error: "Email and password required",
                lastPageRoute: "/api/auth/login"
            });
        };
        try {
            const result = await loginUser(email, password);
            const {token, username, isAdmin,userId} = result
            //we can store more things in the cookie if need be (like 'close' friends via friend lookup in the future)
            req.session.member = {
                token :token || "ERR_NO_TOKEN_RETURNED",
                username : username || "ERR_NO_USRNM_RETURNED",
                isAdmin : isAdmin || false,
                userId : result.userId || null
            }
        } catch (error) {
            return res.status(500).render("error",{
                statusCode :500,
                error: `${error}.Unable to login User.`,
                lastPageRoute: "/api/auth/login"
            });
        }
        
        req.session.message = "User Logged In Successfully!";
        return res.status(200).redirect('/home'); 
        
    } catch (err) {
        next(err);
    }
});

router.route('/logout')
.get(async (req, res) => {
//   req.session.destroy();
req.session.message = "User successfully signed out!";
req.session.member = null; 
  return res.redirect('/api/auth/login');
  //render("login",{title:"BiteCheck : Login",msg: ""});
});

export default router;


