<<<<<<< HEAD

//this file generates 30 users with random usernames, bios,and profile pictures to populate the users database for testing purposes.

import {dbConnection, closeConnection} from './config/mongoConnection.js';
import {ObjectId} from 'mongodb';
import helpers from './helpers.js';
import bcrypt from 'bcrypt';

const NUM_USERS = 30;
const main = async () => {
  const db = await dbConnection();
  const userCollection = await db.collection('users');
  userCollection.drop();

  let passwords = helpers.generateRandomPasswords(NUM_USERS); //generate 30 random passwords to use for the seeded users. 
  console.log("Generated passwords for seeded users:", passwords);

  passwords = await Promise.all(passwords.map(password => bcrypt.hash(password, 12))); //hash the passwords before storing them in the database

    
const userData = [
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b101'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'John',
    lastName: 'Doe',
    status: 'Public',
    appSearchRadiusMeters: 1200,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'john.doe@example.com',
    username: 'john_doe',
    age: 30,
    password: passwords[0],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b102'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Emma',
    lastName: 'Smith',
    status: 'Public',
    appSearchRadiusMeters: 4500,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'emma.smith@example.com',
    username: 'emma_smith',
    age: 24,
    password: passwords[1],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b103'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Liam',
    lastName: 'Johnson',
    status: 'Private',
    appSearchRadiusMeters: 9800,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'liam.johnson@example.com',
    username: 'liam_johnson',
    age: 27,
    password: passwords[2],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b104'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Olivia',
    lastName: 'Brown',
    status: 'Public',
    appSearchRadiusMeters: 15000,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'olivia.brown@example.com',
    username: 'olivia_brown',
    age: 22,
    password: passwords[3],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b105'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Noah',
    lastName: 'Davis',
    status: 'Public',
    appSearchRadiusMeters: 23000,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'noah.davis@example.com',
    username: 'noah_davis',
    age: 35,
    password: passwords[4],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b106'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Sophia',
    lastName: 'Miller',
    status: 'Private',
    appSearchRadiusMeters: 7600,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'sophia.miller@example.com',
    username: 'sophia_miller',
    age: 29,
    password: passwords[5],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b107'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'James',
    lastName: 'Wilson',
    status: 'Public',
    appSearchRadiusMeters: 29000,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'james.wilson@example.com',
    username: 'james_wilson',
    age: 31,
    password: passwords[6],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b108'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Ava',
    lastName: 'Moore',
    status: 'Public',
    appSearchRadiusMeters: 3400,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'ava.moore@example.com',
    username: 'ava_moore',
    age: 20,
    password: passwords[7],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b109'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'William',
    lastName: 'Taylor',
    status: 'Private',
    appSearchRadiusMeters: 8700,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'william.taylor@example.com',
    username: 'william_taylor',
    age: 41,
    password: passwords[8],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b110'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Isabella',
    lastName: 'Anderson',
    status: 'Public',
    appSearchRadiusMeters: 5100,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'isabella.anderson@example.com',
    username: 'isabella_anderson',
    age: 26,
    password: passwords[9],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b111'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Benjamin',
    lastName: 'Thomas',
    status: 'Public',
    appSearchRadiusMeters: 13200,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'benjamin.thomas@example.com',
    username: 'benjamin_thomas',
    age: 33,
    password: passwords[10],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b112'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Mia',
    lastName: 'Jackson',
    status: 'Private',
    appSearchRadiusMeters: 21000,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'mia.jackson@example.com',
    username: 'mia_jackson',
    age: 19,
    password: passwords[11],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b113'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Lucas',
    lastName: 'White',
    status: 'Public',
    appSearchRadiusMeters: 6800,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'lucas.white@example.com',
    username: 'lucas_white',
    age: 28,
    password: passwords[12],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b114'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Charlotte',
    lastName: 'Harris',
    status: 'Public',
    appSearchRadiusMeters: 19500,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'charlotte.harris@example.com',
    username: 'charlotte_harris',
    age: 25,
    password: passwords[13],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b115'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Henry',
    lastName: 'Martin',
    status: 'Private',
    appSearchRadiusMeters: 24500,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'henry.martin@example.com',
    username: 'henry_martin',
    age: 37,
    password: passwords[14],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b116'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Amelia',
    lastName: 'Thompson',
    status: 'Public',
    appSearchRadiusMeters: 11200,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'amelia.thompson@example.com',
    username: 'amelia_thompson',
    age: 23,
    password: passwords[15],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b117'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Alexander',
    lastName: 'Garcia',
    status: 'Public',
    appSearchRadiusMeters: 5400,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'alexander.garcia@example.com',
    username: 'alexander_garcia',
    age: 32,
    password: passwords[16],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b118'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Evelyn',
    lastName: 'Martinez',
    status: 'Private',
    appSearchRadiusMeters: 27800,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'evelyn.martinez@example.com',
    username: 'evelyn_martinez',
    age: 21,
    password: passwords[17],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b119'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Daniel',
    lastName: 'Robinson',
    status: 'Public',
    appSearchRadiusMeters: 6400,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'daniel.robinson@example.com',
    username: 'daniel_robinson',
    age: 40,
    password: passwords[18],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b120'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Harper',
    lastName: 'Clark',
    status: 'Public',
    appSearchRadiusMeters: 8900,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'harper.clark@example.com',
    username: 'harper_clark',
    age: 18,
    password: passwords[19],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b121'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Michael',
    lastName: 'Rodriguez',
    status: 'Private',
    appSearchRadiusMeters: 17300,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'michael.rodriguez@example.com',
    username: 'michael_rodriguez',
    age: 36,
    password: passwords[20],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b122'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Ella',
    lastName: 'Lewis',
    status: 'Public',
    appSearchRadiusMeters: 9200,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'ella.lewis@example.com',
    username: 'ella_lewis',
    age: 17,
    password: passwords[21],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b123'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Ethan',
    lastName: 'Lee',
    status: 'Public',
    appSearchRadiusMeters: 28800,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'ethan.lee@example.com',
    username: 'ethan_lee',
    age: 34,
    password: passwords[22],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b124'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Grace',
    lastName: 'Walker',
    status: 'Private',
    appSearchRadiusMeters: 760,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'grace.walker@example.com',
    username: 'grace_walker',
    age: 16,
    password: passwords[23],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b125'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Jacob',
    lastName: 'Hall',
    status: 'Public',
    appSearchRadiusMeters: 14100,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'jacob.hall@example.com',
    username: 'jacob_hall',
    age: 39,
    password: passwords[24],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b126'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Chloe',
    lastName: 'Allen',
    status: 'Public',
    appSearchRadiusMeters: 20500,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'chloe.allen@example.com',
    username: 'chloe_allen',
    age: 27,
    password: passwords[25],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b127'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Logan',
    lastName: 'Young',
    status: 'Private',
    appSearchRadiusMeters: 26600,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'logan.young@example.com',
    username: 'logan_young',
    age: 42,
    password: passwords[26],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b128'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Zoe',
    lastName: 'King',
    status: 'Public',
    appSearchRadiusMeters: 3600,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'zoe.king@example.com',
    username: 'zoe_king',
    age: 15,
    password: passwords[27],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b129'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Sebastian',
    lastName: 'Scott',
    status: 'Public',
    appSearchRadiusMeters: 12400,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'sebastian.scott@example.com',
    username: 'sebastian_scott',
    age: 38,
    password: passwords[28],
    isAdmin: false
  },
  {
    _id: new ObjectId('64b7c2f8f1d4c3b2f8e4b130'),
    profilePhoto: "/uploads/profilePhotos/defaultProfile.jpg",
    firstName: 'Lily',
    lastName: 'Green',
    status: 'Private',
    appSearchRadiusMeters: 29900,
    favRestaurants: [],
    friends: [],
    blockedUsers: [],
    email: 'lily.green@example.com',
    username: 'lily_green',
    age: 21,
    password: passwords[29],
    isAdmin: false
  }
];

  await userCollection.insertMany(userData);

  console.log(`Seeded ${NUM_USERS} Users to users collection`);

  await closeConnection();
};

main();
=======
// A temporary "Seeder" function to test your God View
import { getdb } from "./database/db.js";

export const seedTestReviews = async () => {
    const db = getdb();
    const mockReviews = [
        { comment: "The food here was amazing!", reports: 0, userId: "user_1", createdAt: new Date() },
        { comment: "Terrible service, avoid this place.", reports: 3, userId: "user_2", createdAt: new Date() },
        { comment: "SPAM CLICK THIS LINK FOR FREE PIZZA", reports: 12, userId: "hacker_99", createdAt: new Date() }
    ];
    await db.collection('reviews').insertMany(mockReviews);
};
>>>>>>> ea67eb6e6aa533f2a63858dc8581bee481766e89
