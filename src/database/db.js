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
        db.dropDatabase();
        await db.collection('restaurants').createIndex({location: '2dsphere'});
        //await db.collection('restaurants').createIndex({name: 'text', cuisine: 'text'});
        await db.collection('restaurants').createIndex({name: 1})
        await db.collection('restaurants').createIndex({cuisine: 1})
        console.log(`Connected to MongoDB': ${settings.mongo.dbname}`);
        return db;

    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}


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


