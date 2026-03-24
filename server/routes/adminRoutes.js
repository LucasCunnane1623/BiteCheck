import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeAdmin } from '../middleware/admin';
import { getdb } from '../database/db';

const router = Router

router.post('/restaurants', authenticate, authorizeAdmin, async (req, res) => {
    const db = getdb();
    const result = await db.collection('restaurants').insertOne(req.body);
    res.status(201).json(result)
})


router.delete('/restaurants/:camis', authenticate, authorizeAdmin, async (req, res) => {
    const db = getdb();
    await db.collection('restaurants').deleteOne({camis: req.params.camis});
    res.json({message: "Restaurant removed by admin"})
});
