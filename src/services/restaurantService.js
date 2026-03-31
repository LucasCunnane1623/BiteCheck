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


export const getRestaurantDetails = async (camis) => {
    const db = getdb();

    const restaurant = await db.collection('restaurants').findOne({camis: camis});
    
    if (!restaurant){
        throw new Error("Restaurant not found");
    }

    const communityBuzz = await db.collection('posts')
        .find({content: {$regex: restaurant.name, $options: "i"}})
        .limit(5)
        .toArray();
    
    return { ...restaurant, communityBuzz };
}