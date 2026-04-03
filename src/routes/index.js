import express from "express";
import authRoutes from './authroutes/authRoutes.js';
import adminRoutes from './adminroutes/adminRoutes.js';
import userRoutes from './userroutes/userRoutes.js';
import postRoutes from './postroutes/postRoutes.js';
import landingRoutes from "./landingRoutes.js";

// sub-routes for restaurant domain
import discoveryRoutes from './restaurant/discovery.routes.js';
import detailRoutes from './restaurant/details.routes.js';

const router = express.Router();

// Domain-level Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/', landingRoutes);


//restaurant Routes (order-critical)
// First: check for static routes like /suggest, /near 
router.use('/restaurants', discoveryRoutes);

// Second: Catch-all for dynamic ID's like /:id, /:id/reviews etc...
router.use('/restaurants', detailRoutes);

export default router;

