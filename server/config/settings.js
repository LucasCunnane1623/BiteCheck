import dotenv from 'dotenv';

dotenv.config();

const settings = {
    mongo:{
        url: process.env.MONGO_URL || 'mongodb://localhost:27017',
        dbname: 'BiteCheckDB',
        collections: {
            restaurants: 'restaurants',
            reviews: 'reviews',
            users: 'users',
        }
    },

    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
    },

    nycApi: {
        datasetIdentifier: '43nn-pn8j',
        baseUrl: 'https://data.cityofnewyork.us/resource/43nn-pn8j.json',
        appToken: process.env.NYC_API_APP_TOKEN || '',
    },

    logic: {
        criticalThresholdRed: 3,
        criticalThresholdYellow: 1,
        inspectionHistoryMonths: 12,
    },

    secret: process.env.JWT_SECRET || "syFzeOTlrfAiLN3g6OpxmH1fGFBM7PlmF2b87L7TMX7"
};

export default settings;