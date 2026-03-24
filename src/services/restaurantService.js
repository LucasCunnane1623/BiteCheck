import { getdb } from "../database/db.js";

export const searchRestaurants = async (query, limit=20) =>{
    const db = getdb();
    return await db.collection('restaurants')
        .find({ $text: {$search : query}})
        .project({ score: {$meta: "textScore"}})
        .sort({ score: {$meta: "textScore"}})
        .limit(limit)
        .toArray();
}
