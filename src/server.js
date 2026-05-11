import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import exphbs from 'express-handlebars';
import session from 'express-session';
import path from 'path';

// import { seedTestReviews } from './seed.js';
import settings from './config/settings.js';
import { connect } from './database/db.js';
import { syncRestaurants } from './services/dataSync.js';
import { errorHandler } from './middleware/errorhandler.js';
import { fileURLToPath } from 'url';
import { serverdebug,setupMessaging} from './middleware/auth.js';
import landingRoutes from "./routes/landingRoutes.js";
import methodOverride from 'method-override';
import adminroutes from './routes/adminroutes/adminRoutes.js';

// Import routes//import restaurantRoutes from './routes/restaurantRoutes.js';
// import authRoutes from './routes/authroutes/authRoutes.js';
// import postRoutes from './routes/postroutes/postRoutes.js';
// import userRoutes from './routes/userroutes/userRoutes.js';
// import adminRoutes from './routes/adminroutes/adminRoutes.js';


// Master Router -- handles all the logic wihout collisions
import apirouter from './routes/index.js'


//path variable setups
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Initialize Express app
const app = express();

//Setting up the cookie to check if the user is signed in or not 
app.use(
  session({
    name: 'ClubAuthState',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 1000 * 60 * 60}
  })
);

// protect against common vulnerabilities with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://cdn.jsdelivr.net"],
            scriptSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://cdn.jsdelivr.net"],
            connectSrc: ["'self'", "https://maps.googleapis.com"],
            imgSrc: ["'self'", "https://maps.gstatic.com", "https://*.googleapis.com", "data:"],
            frameSrc: ["'self'", "https://www.google.com"],
        }
    }
}));

// Apply rate limiting to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

//Static Routes
app.use(express.static(path.join(__dirname, 'public')));
app.use('/partials', express.static(path.join(__dirname, 'views/partials')));

// Global middleware
app.use(morgan('dev')); // logging middleware
app.use(cors());            // allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));
//we can also use this server debugger method to track exactly what routes cause issues 
app.use(serverdebug);
//we can use this messaging middleware to set a global message that we can flash upon hitting a route correctly
app.use(setupMessaging);


//--------------- This method allows for performing POST and PUT operations without using POSTMAN --------------------
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  // let the next middleware run:
  next();
};
//------------------------------------------------------------------------------


//public routes '/'  '/home'
app.use(methodOverride('_method'));
app.use(rewriteUnsupportedBrowserMethods);   
app.use("/",landingRoutes);      
// api routes   
app.use('/api', apirouter);

app.use('/api/admin', adminroutes);

// background Sync function.
const startDataSync = async () => {
    try{
        console.log("Background Sync Started....")
        // await seedTestReviews();
        await syncRestaurants();
        console.log("Background Sync Completed.")
    } catch (err){
        console.error("Background Sync Failed:", err.message);
    }
}


//--------------- Added express handlebars support --------------------
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
//   partialsDir: [path.join(__dirname, 'views/partials')],
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
      return new Handlebars.SafeString(JSON.stringify(obj));
    }
  }
});
app.engine('handlebars',handlebarsInstance.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views'));


app.use((req, res, next) => {
    
    res.locals.user = req.session.member || null; 
    
    // Map your message correctly
    res.locals.message = req.session.message || null;
    delete req.session.message;
    
    next();
});

//------------------------------------------------------------------------------

const init = async () => {
    try {
        // connect to the database
        console.log('Connecting to:', process.env.MONGO_URL || 'mongodb://localhost:27017');
        await connect();
        console.log("Connected to database successfully.");
        // start the server
        app.listen(settings.server.port, () => {
            console.log(`BiteCheck running: http://localhost:${settings.server.port}`);
        });
        
        // function to sync restaurant data from the external API to our database, 
        // runs in the background and does not block the server from starting.
        await startDataSync();

        // Schedule the sync to run every hour (3600000 milliseconds)
        setInterval(startDataSync, 60 * 60 * 1000); // Schedule to run every hour

    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
};
init();

// for any errors that might occur in the routes,
//  we can use a global error handler middleware to 
// catch and handle them gracefully, ensuring that the
//  server doesn't crash and provides meaningful 
// error responses to the client.
app.use(errorHandler);

