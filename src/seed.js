// A temporary "Seeder" function to test your God View
import { connect, getdb, close } from "./database/db.js";

export const seedTestReviews = async () => {
    const db = getdb();
    const mockReviews = [
        { comment: "The food here was amazing!", reports: 0, userId: "user_1", createdAt: new Date() },
        { comment: "Terrible service, avoid this place.", reports: 3, userId: "user_2", createdAt: new Date() },
        { comment: "SPAM CLICK THIS LINK FOR FREE PIZZA", reports: 12, userId: "hacker_99", createdAt: new Date() }
    ];
    await db.collection('reviews').insertMany(mockReviews);
};

export const seedTestRestaurants = async () => {
    const db = getdb();

    const existing = await db.collection('restaurants').findOne({ camis: '00000001' });
    if (existing) {
        console.log('Test restaurants already exist, skipping.');
        return;
    }

    await db.collection('restaurants').insertMany([
        {
            camis: '00000001',
            name: 'Test Pizza Place',
            cuisine: 'Italian',
            priceRange: '$$',
            address: '123 Main St, New York, NY',
            waitTime: 15,
            score: 88,
            color: 'green',
            coords: { lat: 40.730610, lng: -73.935242 },
            comments: [
                { author: 'Alice', text: 'Very clean!', date: '2024-01-01' }
            ],
            inspections: [
                {
                    date: '2024-01-15',
                    inspectorName: 'John Smith',
                    generalNotes: 'All good',
                    violations: []
                }
            ]
        },
        {
            camis: '00000002',
            name: 'Test Burger Spot',
            cuisine: 'American',
            priceRange: '$',
            address: '456 Broadway, New York, NY',
            waitTime: 10,
            score: 65,
            color: 'yellow',
            coords: { lat: 40.732610, lng: -73.932242 },
            comments: [],
            inspections: [
                {
                    date: '2024-02-10',
                    inspectorName: 'Jane Doe',
                    generalNotes: 'Minor issues found',
                    violations: [
                        { type: 'Food Temperature', notes: 'Cold food not stored correctly' }
                    ]
                }
            ]
        },
        {
            camis: '00000003',
            name: 'Test Sushi Bar',
            cuisine: 'Japanese',
            priceRange: '$$$',
            address: '789 Park Ave, New York, NY',
            waitTime: 25,
            score: 40,
            color: 'red',
            coords: { lat: 40.728610, lng: -73.938242 },
            comments: [],
            inspections: [
                {
                    date: '2024-03-05',
                    inspectorName: 'Bob Lee',
                    generalNotes: 'Several critical violations',
                    violations: [
                        { type: 'Sanitation', notes: 'Surfaces not properly cleaned' },
                        { type: 'Pest Control', notes: 'Evidence of rodents' }
                    ]
                }
            ]
        }
    ]);

    console.log('Test restaurants seeded.');
};

// Run both seeders
const run = async () => {
    await connect();
    await seedTestReviews();
    await seedTestRestaurants();
    console.log('Seed complete');
    await close();
};

if (process.argv[1].includes('seed')) {
    run();
}