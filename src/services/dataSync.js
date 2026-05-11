import axios from 'axios';
import settings from '../config/settings.js';
import { getdb } from '../database/db.js';

import { get_illness_risk } from './risks.js';


export const syncRestaurants = async (limit = 3000000) => {
    const db = getdb();
    const collection = db.collection(settings.mongo.collections.restaurants);

    try {
        const response = await axios.get(settings.nycApi.baseUrl, {
            params: {
                "$limit": limit,
                "$$app_token": settings.nycApi.appToken,
                "$order": "inspection_date DESC"
            }
        });

        const rawData = response.data;

        // 1. Filter out records with invalid coordinates
        const validData = rawData.filter(row => {
            const lng = parseFloat(row.longitude);
            const lat = parseFloat(row.latitude);
            // Only keep rows where both are valid finite numbers
            return !isNaN(lng) && !isNaN(lat);
        });

        // 2. Map only the valid records to operations
        const ops = validData.map(row => {
            const riskInfo = get_illness_risk(row.violation_code);
            return {
                updateOne: {
                    filter: { camis: row.camis },
                    update: {
                        $set: {
                            name: row.dba,
                            boro: row.boro,
                            address: `${row.building} ${row.street}`,
                            zipcode: row.zipcode,
                            cuisine: row.cuisine_description,
                            location: {
                                type: "Point",
                                coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
                            },
                            lastUpdated: new Date()
                        },
                        $addToSet: {
                            inspections: {
                                date: row.inspection_date,
                                score: parseInt(row.score) || 0,
                                grade: row.grade || "N/A",
                                violation_code: row.violation_code,
                                description: row.violation_description,
                                isCritical: row.critical_flag === 'Critical',
                                potential_illness: riskInfo.illness,
                                riskSeverity: riskInfo.severity
                            }
                        }
                    },
                    upsert: true
                }
            };
        });

        if (ops.length > 0) {
            const result = await collection.bulkWrite(ops);
            console.log(`Sync Completed: ${result.upsertedCount} new, ${result.modifiedCount} updated. (Skipped ${rawData.length - validData.length} invalid records)`);
        } else {
            console.log("No valid records found to sync in this batch.");
        }
        
    } catch (err) {
        console.error("Sync error:", err.message);
        // throw err;
    }
};