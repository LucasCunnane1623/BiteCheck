import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import settings from './config/settings.js';
import { connect } from './database/db.js';
import { syncRestaurants } from './services/dataSync.js';
import { errorHandler } from './middleware/errorhandler.js';

// Import routes
import restaurantRoutes from './routes/restaurantRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(express.json());

//Backend API routes, serve information for the user
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);

const init = async () => {
    try {
        await connect();
        await syncRestaurants(); 
        
        setInterval(async () => {
            await syncRestaurants(); 
        }, 24 * 60 * 60 * 1000);
        
        app.listen(settings.server.port, () => {
            console.log(`BiteCheck running: http://localhost:${settings.server.port}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
};

init(); 

app.use(errorHandler);