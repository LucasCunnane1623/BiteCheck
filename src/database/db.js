import { MongoClient } from 'mongodb';
import settings from '../config/settings.js';

let client = null;
let db = null;

export const connect = async () => {
    if (db) {
        return db;
    }

    try {
        client = await MongoClient.connect(settings.mongo.url);
        db = client.db(settings.mongo.dbname);
        const restaurants = db.collection('restaurants');
        await restaurants.createIndex({ location: '2dsphere' });

        const indexes = await restaurants.indexes();
//checks for the existence of old indexes so that no conflicts happen
        const oldTextIndex = indexes.find(index => index.name === "name_text_cuisine_text");
        if (oldTextIndex) {
            await restaurants.dropIndex("name_text_cuisine_text");
        }

        await restaurants.createIndex(
            { name: 'text', address: 'text', cuisine: 'text' },
            { name: "name_text_address_text_cuisine_text" }
        );
        await restaurants.createIndex({ name: 1 });
        await restaurants.createIndex({ cuisine: 1 });

        console.log(`Connected to MongoDB: ${settings.mongo.dbname}`);
        return db;

    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};


export const close = async () => {
    if (client){
        await client.close();
        db = null;
        client = null;
    }
}

export const  getdb = () => {
    if (!db) {
        throw new Error("Database not initialized, call connect() first.")
    }
    return db;
};


