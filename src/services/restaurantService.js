import { getdb } from "../database/db.js";


/**
 * @function fetches restaurants based on relevance
 *  executes a full text search e.g best pizza in brooklyn
 * @input := query {string} -> keywords to search best pizza brooklyn
 *           limit -> limits the results to 20 objects 
 * @text_index := makes use of the text index to search for relevance
 * @logic uses mongodb's internal scoring algorithm to calulate relevance
 * @output := array of restaurant documents
 * 
 * @example := const results = await searchRestaurants("Dunkin Donuts");
 * 
 */

export const searchRestaurants = async (query, limit=20) => {
    const db = getdb();
    return await db.collection('restaurants')
        .find({ $text: { $search: query } })
        .project({ 
            textScore: { $meta: "textScore" },
            name: 1,
            cuisine: 1,
            address: 1,
            score: 1,
            color: 1,
            location: 1,
            coords: 1,
            inspections: 1
        })
        .sort({ textScore: { $meta: "textScore" } })
        .limit(limit)
        .toArray();
}

/**
 * @function fetches the restaurant details using camis id
 * once camis id is done fetching the restaurant we search for
 * name of the restaurant in collection posts where we fetch the 
 * first 5 posts for that restaurant name
 * 
 * @input :- camis id
 * @output := object of the restaurant and community buzz array
 * 
 * @example := const result = await getRestaurantDetails(8767898767898)
 * output:=  {{restaurant}, [post1, post2, post3, post4, post5]}
 * 
 */
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


/**
 * 
 * Universal Suggestion engine
 * Combines Cuisine and restaurant name matching into one efficient call.
 * COLLSCAN (collection scan) performed by mongodb
 * index scan optimization
 * @desc Performs a parallel search across restaurant names and cuisine using mongodb aggregation facets
 * @access private Internal Service layer
 * @params query {string} - the partial search string from user input
 * @logic - Uses $facet to branch the search into 2 simultaneous pipelines
 *         categories and restaurants
 * 
 * @output array a flattened array of suggestion objects containing text, type and metadata
 * 
 * @example:- 
 * const results = await getUniversalSuggestions("chi");
 * 
 * // returns : [{text: "Chinese", type: category}, {text: "chipotle", type: restaurant}...... etc]
 * 
 */

export const getUniversalSuggestions = async (query) => {
    const db = getdb();
    // "starts with" search "i" is the ignore case for uppercase and lowercase
    const searchRegex = new RegExp(`^${query}`, "i");

    return await db.collection('restaurants').aggregate([
        {   
            // the facet stage allows us to process the same data in two different ways
            // since we are pulling the whole collection the data enters in a huge stream
            // the $facet then splits into 2 independent pipelines
            // namely categories and restaurants
            $facet:{
                // pipeline for matching cuisines (e.g pizza, chinese, indian, pasta etc.)
                //category search
                "categories": [
                    // (filter stage)$match stage find the documents in which the value of the query
                    // in this stage we match the regex with cuisines(check restaurant schema)
                    // after the cuisine field is found it checks for searchRegex
                    // and $regex is used for starts with 
                    {$match: {cuisine : {$regex : searchRegex}}},
                    // $group stage groups documents by their cuisines
                    // which can be set using $_id: $cuisines
                    // this basically creates a new object with _id as cuisine name
                    {$group:{_id: "$cuisine"}}, // ensures that one cuisine appears only once
                    // $limit fetches the first 3 documents
                    {$limit: 3},
                    // this part is for frontend , the front end should expect a field called 
                    // text which is why we project _id as text (renaming)
                    {$project: {text: "$_id", type: "category"}}
                ],
                
                // pipeline for matching specific restaurant names
                "restaurants": [
                    {$match: {name: {$regex: searchRegex}}},
                    {$limit: 6},
                    {
                        $project: {
                            text: "$name", // restaurant name becomes main text "$name comes from $match stage"
                            subtext: "$boro", // borough becomes subtext
                            type: "restaurant", // type of establishment
                            camis: 1, // unique identifier
                            inspections: 1 // necessary for color coding on the frontend
                        }
                    }
                ]
            }
        },
        // combine the results from both facets into a single array
        {
            $project:{
                suggestions: {$concatArrays: ["$categories", "$restaurants"]}
            }
        }
    ]).toArray()
};