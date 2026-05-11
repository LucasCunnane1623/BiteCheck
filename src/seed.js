//this file generates 30 users with random usernames, bios,and profile pictures to populate the users database for testing purposes.

import {dbConnection, closeConnection} from './config/mongoConnection.js';
import {ObjectId} from 'mongodb';
import helpers from './helpers.js';
import bcrypt from 'bcrypt';


const NUM_USERS = 30;
const NUM_POSTS = 10;

const main = async () => {
  const db = await dbConnection();
  const userCollection = await db.collection('users');
  const reviewCollection = await db.collection('reviews');
  const postsCollection = await db.collection('posts');
  const restaurantCollection = await db.collection('restaurants');

  await userCollection.drop();
  await reviewCollection.drop();
  await postsCollection.drop();
  await restaurantCollection.drop();

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
      username: 'john-doe',
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
      username: 'emma-smith',
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
      username: 'liam-johnson',
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
      username: 'olivia-brown',
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
      username: 'noah-davis',
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
      username: 'sophia-miller',
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
      username: 'james-wilson',
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
      username: 'ava-moore',
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
      username: 'william-taylor',
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
      username: 'isabella-anderson',
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
      username: 'benjamin-thomas',
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
      username: 'mia-jackson',
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
      username: 'lucas-white',
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
      username: 'charlotte-harris',
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
      username: 'henry-martin',
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
      username: 'amelia-thompson',
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
      username: 'alexander-garcia',
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
      username: 'evelyn-martinez',
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
      username: 'daniel-robinson',
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
      username: 'harper-clark',
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
      username: 'michael-rodriguez',
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
      username: 'ella-lewis',
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
      username: 'ethan-lee',
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
      username: 'grace-walker',
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
      username: 'jacob-hall',
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
      username: 'chloe-allen',
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
      username: 'logan-young',
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
      username: 'zoe-king',
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
      username: 'sebastian-scott',
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
      username: 'lily-green',
      age: 21,
      password: passwords[29],
      isAdmin: false
    }
  ];
  console.log(`Seeded ${NUM_USERS} Users to users collection`);
  await userCollection.insertMany(userData);

  //seed the test review 
  const mockReviews = [
      { comment: "The food here was amazing!", reports: 0, userId: "user_1", createdAt: new Date() },
      { comment: "Terrible service, avoid this place.", reports: 3, userId: "user_2", createdAt: new Date() },
      { comment: "SPAM CLICK THIS LINK FOR FREE PIZZA", reports: 12, userId: "hacker_99", createdAt: new Date() }
  ];
  await db.collection('reviews').insertMany(mockReviews);

  console.log(`Seeded 3 reviews to reviews collection`);
    

  const testPosts = [
    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b101'),
      content: "Just tried the spicy ramen at Ichiran and it completely lived up to the hype.",
      businessName: "Ichiran Ramen",
      likes: [
        '64b7c2f8f1d4c3b2f8e4b102',
        '64b7c2f8f1d4c3b2f8e4b103'
      ],
      dislikes: [],
      comments: [
        {
          commentId: new ObjectId(),
          userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b104'),
          username: 'olivia-brown',
          text: "Need to try this place soon.",
          createdOn: new Date()
        }
      ],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b105'),
      content: "Coffee quality was amazing but the wait time was brutal.",
      businessName: "Bean & Brew Cafe",
      likes: [
        '64b7c2f8f1d4c3b2f8e4b106'
      ],
      dislikes: [
        '64b7c2f8f1d4c3b2f8e4b107'
      ],
      comments: [],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b108'),
      content: "Best tacos I've had in months.",
      businessName: "Taco Fiesta",
      likes: [
        '64b7c2f8f1d4c3b2f8e4b109',
        '64b7c2f8f1d4c3b2f8e4b110',
        '64b7c2f8f1d4c3b2f8e4b111'
      ],
      dislikes: [],
      comments: [
        {
          commentId: new ObjectId(),
          userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b112'),
          username: 'mia-jackson',
          text: "Their birria tacos are elite.",
          createdOn: new Date()
        },
        {
          commentId: new ObjectId(),
          userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b113'),
          username: 'lucas-white',
          text: "Facts.",
          createdOn: new Date()
        }
      ],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b114'),
      content: "Not worth the price honestly.",
      businessName: "Golden Steakhouse",
      likes: [],
      dislikes: [
        '64b7c2f8f1d4c3b2f8e4b115'
      ],
      comments: [],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b116'),
      content: "Their sushi platter presentation was beautiful.",
      businessName: "Sakura Sushi",
      likes: [
        '64b7c2f8f1d4c3b2f8e4b117',
        '64b7c2f8f1d4c3b2f8e4b118'
      ],
      dislikes: [],
      comments: [
        {
          commentId: new ObjectId(),
          userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b119'),
          username: 'daniel-robinson',
          text: "Their salmon rolls are great too.",
          createdOn: new Date()
        }
      ],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b120'),
      content: "Cute atmosphere and friendly staff.",
      businessName: "Moonlight Bakery",
      likes: [
        '64b7c2f8f1d4c3b2f8e4b121'
      ],
      dislikes: [],
      comments: [],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b122'),
      content: "The burger was dry but the fries saved the meal.",
      businessName: "Burger Barn",
      likes: [],
      dislikes: [
        '64b7c2f8f1d4c3b2f8e4b123'
      ],
      comments: [
        {
          commentId: new ObjectId(),
          userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b124'),
          username: 'grace-walker',
          text: "I had the opposite experience lol.",
          createdOn: new Date()
        }
      ],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b125'),
      content: "Late night pizza hits different here.",
      businessName: "Tony's Pizza",
      likes: [
        '64b7c2f8f1d4c3b2f8e4b126',
        '64b7c2f8f1d4c3b2f8e4b127'
      ],
      dislikes: [],
      comments: [],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b128'),
      content: "Really good vegan options and affordable prices.",
      businessName: "Green Garden",
      likes: [
        '64b7c2f8f1d4c3b2f8e4b129'
      ],
      dislikes: [],
      comments: [
        {
          commentId: new ObjectId(),
          userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b130'),
          username: 'lily-green',
          text: "Their tofu bowl is my favorite.",
          createdOn: new Date()
        }
      ],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    },

    {
      userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b103'),
      content: "The desserts here are dangerously good.",
      businessName: "Sugar Rush Cafe",
      likes: [
        '64b7c2f8f1d4c3b2f8e4b101',
        '64b7c2f8f1d4c3b2f8e4b105',
        '64b7c2f8f1d4c3b2f8e4b110'
      ],
      dislikes: [],
      comments: [
        {
          commentId: new ObjectId(),
          userId: new ObjectId('64b7c2f8f1d4c3b2f8e4b102'),
          username: 'emma-smith',
          text: "Their cheesecake is insane.",
          createdOn: new Date()
        }
      ],
      isFlagged: false,
      reports: [],
      createdOn: new Date()
    }
  ];

  const restaurantData = [
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c201'),
      camis: '10000001',
      name: 'Ichiran Ramen',
      cuisine: 'Japanese',
      priceRange: '$$',
      address: '132 W 49th St, New York, NY 10020',
      waitTime: 15,
      score: 92,
      color: 'green',
      location: { type: 'Point', coordinates: [-73.9812, 40.7580] },
      comments: [
        { author: 'john-doe',     text: 'Absolutely spotless kitchen area visible from the counter.', date: '2025-03-10' },
        { author: 'emma-smith',   text: 'Staff wear gloves and change them between every bowl.',       date: '2025-03-18' },
        { author: 'olivia-brown', text: 'Need to try this place ASAP.',                               date: '2025-04-01' },
      ],
      inspections: [
        {
          date: '2025-02-14', inspectorName: 'A. Rivera',
          generalNotes: 'Excellent hygiene standards throughout. No corrective actions required.',
          isCritical: false, violations: [],
        },
        {
          date: '2024-08-22', inspectorName: 'T. Nguyen',
          generalNotes: 'Minor storage labeling issue — corrected on-site.',
          isCritical: false,
          violations: [
            { type: 'Improper food storage labeling', notes: 'Unlabeled containers in walk-in cooler. Corrected immediately.' },
          ],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c202'),
      camis: '10000002',
      name: 'Bean & Brew Cafe',
      cuisine: 'Cafe / Coffee',
      priceRange: '$',
      address: '45 E 8th St, New York, NY 10003',
      waitTime: 20,
      score: 78,
      color: 'yellow',
      location: { type: 'Point', coordinates: [-73.9954, 40.7308] },
      comments: [
        { author: 'noah-davis',    text: 'Coffee is incredible but wait times are brutal on weekends.', date: '2025-01-05' },
        { author: 'sophia-miller', text: 'Saw them wipe the espresso machine down, good sign.',         date: '2025-02-20' },
      ],
      inspections: [
        {
          date: '2025-01-30', inspectorName: 'M. Okafor',
          generalNotes: 'Several minor violations noted. Follow-up scheduled in 90 days.',
          isCritical: false,
          violations: [
            { type: 'Handwashing facility not properly stocked', notes: 'Soap dispenser empty at rear sink. Restocked during inspection.' },
            { type: 'Food contact surface not sanitized',        notes: 'Blender base showed residue buildup. Staff cleaned immediately.' },
          ],
        },
        {
          date: '2024-06-11', inspectorName: 'A. Rivera',
          generalNotes: 'Passed with minor notes on temperature logging.',
          isCritical: false,
          violations: [
            { type: 'Temperature logs incomplete', notes: 'Milk fridge log missing 3 entries. Manager updated log on-site.' },
          ],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c203'),
      camis: '10000003',
      name: 'Taco Fiesta',
      cuisine: 'Mexican',
      priceRange: '$',
      address: '218 1st Ave, New York, NY 10009',
      waitTime: 10,
      score: 88,
      color: 'green',
      location: { type: 'Point', coordinates: [-73.9823, 40.7265] },
      comments: [
        { author: 'ava-moore',   text: 'Best birria tacos in the city, and the kitchen looks clean.', date: '2025-03-22' },
        { author: 'mia-jackson', text: 'Their birria tacos are elite.',                                date: '2025-03-29' },
        { author: 'lucas-white', text: 'Facts.',                                                       date: '2025-03-30' },
      ],
      inspections: [
        {
          date: '2025-03-05', inspectorName: 'D. Patel',
          generalNotes: 'Clean and well-organized. Staff food handler certifications all current.',
          isCritical: false, violations: [],
        },
        {
          date: '2024-09-17', inspectorName: 'T. Nguyen',
          generalNotes: 'One minor violation — salsa holding temperature slightly below threshold.',
          isCritical: false,
          violations: [
            { type: 'Food held at improper temperature', notes: 'Salsa roja at 38°F, below required 41°F. Adjusted holding unit on-site.' },
          ],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c204'),
      camis: '10000004',
      name: 'Golden Steakhouse',
      cuisine: 'American / Steakhouse',
      priceRange: '$$$$',
      address: '347 W 46th St, New York, NY 10036',
      waitTime: 35,
      score: 54,
      color: 'red',
      location: { type: 'Point', coordinates: [-73.9887, 40.7597] },
      comments: [
        { author: 'charlotte-harris', text: 'Not worth the price honestly.',    date: '2025-02-01' },
        { author: 'henry-martin',     text: 'Saw a roach near the host stand.', date: '2025-02-14' },
      ],
      inspections: [
        {
          date: '2025-02-20', inspectorName: 'M. Okafor',
          generalNotes: 'Multiple critical violations. Partial closure order issued until pest control completed.',
          isCritical: true, description: 'Live roach observed near prep station.',
          potentialIllness: 'Pest contamination risk', riskSeverity: 'HIGH',
          violations: [
            { type: 'Evidence of mice or live roaches',     notes: 'Live roach observed near prep station. Pest control contractor contacted.' },
            { type: 'Plumbing — improper waste disposal',   notes: 'Grease trap overflowing into floor drain. Emergency maintenance called.' },
            { type: 'Food not protected from contamination', notes: 'Raw beef stored above ready-to-eat vegetables in walk-in cooler.' },
          ],
        },
        {
          date: '2024-11-03', inspectorName: 'A. Rivera',
          generalNotes: 'Previous violations mostly addressed. Pest issue re-emerged.',
          isCritical: true, description: 'Droppings found behind oven.',
          potentialIllness: 'Salmonella / cross-contamination', riskSeverity: 'MEDIUM',
          violations: [
            { type: 'Evidence of mice or live roaches', notes: 'Droppings found behind oven. Exterminator report required within 7 days.' },
            { type: 'Improper food storage',            notes: 'Opened raw chicken stored uncovered.' },
          ],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c205'),
      camis: '10000005',
      name: 'Sakura Sushi',
      cuisine: 'Japanese / Sushi',
      priceRange: '$$$',
      address: '11 St Marks Pl, New York, NY 10003',
      waitTime: 25,
      score: 91,
      color: 'green',
      location: { type: 'Point', coordinates: [-73.9893, 40.7285] },
      comments: [
        { author: 'amelia-thompson',  text: 'Sushi platter presentation was beautiful. Kitchen immaculate.', date: '2025-01-15' },
        { author: 'alexander-garcia', text: 'Their salmon rolls are great too.',                              date: '2025-01-22' },
      ],
      inspections: [
        {
          date: '2025-01-08', inspectorName: 'D. Patel',
          generalNotes: 'Outstanding cleanliness. Fish storage temperatures all within spec.',
          isCritical: false, violations: [],
        },
        {
          date: '2024-07-19', inspectorName: 'T. Nguyen',
          generalNotes: 'Minor labeling issue on fish delivery log. No food safety concern.',
          isCritical: false,
          violations: [
            { type: 'Records not maintained', notes: 'Fish receiving log missing supplier signature for one delivery. Updated.' },
          ],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c206'),
      camis: '10000006',
      name: 'Moonlight Bakery',
      cuisine: 'Bakery / Desserts',
      priceRange: '$',
      address: '72 Bedford St, New York, NY 10014',
      waitTime: 5,
      score: 85,
      color: 'green',
      location: { type: 'Point', coordinates: [-74.0034, 40.7331] },
      comments: [
        { author: 'harper-clark',      text: 'Cute atmosphere and friendly staff. Everything looked super clean.', date: '2025-03-05' },
        { author: 'michael-rodriguez', text: 'Their croissants are incredible and the kitchen is open-view.',      date: '2025-03-11' },
      ],
      inspections: [
        {
          date: '2025-03-01', inspectorName: 'A. Rivera',
          generalNotes: 'Clean and well-run operation. All baked goods stored correctly.',
          isCritical: false, violations: [],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c207'),
      camis: '10000007',
      name: 'Burger Barn',
      cuisine: 'American / Burgers',
      priceRange: '$$',
      address: '390 6th Ave, New York, NY 10011',
      waitTime: 12,
      score: 63,
      color: 'yellow',
      location: { type: 'Point', coordinates: [-74.0000, 40.7336] },
      comments: [
        { author: 'ella-lewis',   text: 'Burger was dry but fries were great.', date: '2025-02-08' },
        { author: 'grace-walker', text: 'I had the opposite experience lol.',   date: '2025-02-10' },
      ],
      inspections: [
        {
          date: '2025-02-01', inspectorName: 'M. Okafor',
          generalNotes: 'Several non-critical violations. Corrective plan submitted.',
          isCritical: false,
          violations: [
            { type: 'Wiping cloths — improper use or storage', notes: 'Damp cloths left on counter between uses. Placed in sanitizer solution.' },
            { type: 'Food not protected from contamination',   notes: 'Burger buns stored open on shelf near handwashing area.' },
          ],
        },
        {
          date: '2024-08-14', inspectorName: 'D. Patel',
          generalNotes: 'Similar violations to prior inspection. Management counseled.',
          isCritical: false,
          violations: [
            { type: 'Improper cooling of cooked foods',   notes: 'Chili cooled in large container rather than shallow pans. Corrected.' },
            { type: 'Food contact surface not sanitized', notes: 'Grill scraper had buildup. Replaced with clean tool.' },
          ],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c208'),
      camis: '10000008',
      name: "Tony's Pizza",
      cuisine: 'Italian / Pizza',
      priceRange: '$',
      address: '278 Bleecker St, New York, NY 10014',
      waitTime: 8,
      score: 89,
      color: 'green',
      location: { type: 'Point', coordinates: [-74.0024, 40.7310] },
      comments: [
        { author: 'jacob-hall',  text: 'Late night pizza hits different here.',        date: '2025-01-28' },
        { author: 'chloe-allen', text: 'Always clean, always fast, always delicious.', date: '2025-02-03' },
      ],
      inspections: [
        {
          date: '2025-01-20', inspectorName: 'T. Nguyen',
          generalNotes: 'No violations. One of the cleanest kitchens inspected this month.',
          isCritical: false, violations: [],
        },
        {
          date: '2024-07-09', inspectorName: 'A. Rivera',
          generalNotes: 'Minor issue with dishwasher temperature log. No food safety concern.',
          isCritical: false,
          violations: [
            { type: 'Records not maintained', notes: 'Dishwasher temperature log not filled out for 2 days. Manager corrected.' },
          ],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c209'),
      camis: '10000009',
      name: 'Green Garden',
      cuisine: 'Vegan / Vegetarian',
      priceRange: '$$',
      address: '153 2nd Ave, New York, NY 10003',
      waitTime: 18,
      score: 47,
      color: 'red',
      location: { type: 'Point', coordinates: [-73.9866, 40.7275] },
      comments: [
        { author: 'logan-young',     text: 'Good vegan options but the prep area looked a bit rough.', date: '2025-01-12' },
        { author: 'lily-green',      text: 'Their tofu bowl is my favorite.',                          date: '2025-01-19' },
        { author: 'sebastian-scott', text: 'Health score dropped recently — hope they sort it out.',   date: '2025-02-25' },
      ],
      inspections: [
        {
          date: '2025-02-10', inspectorName: 'D. Patel',
          generalNotes: 'Critical violations found. Closure warning issued. Re-inspection required within 30 days.',
          isCritical: true, description: 'Mouse droppings found in dry storage room.',
          potentialIllness: 'E. coli / cross-contamination', riskSeverity: 'HIGH',
          violations: [
            { type: 'Evidence of mice or live roaches',  notes: 'Mouse droppings in dry storage. Exterminator required before reopening.' },
            { type: 'Food held at improper temperature', notes: 'Tofu held at 52°F — above safe limit of 41°F. Discarded.' },
            { type: 'Handwashing — improper procedure',  notes: 'Staff observed not washing hands between raw and ready-to-eat ingredients.' },
          ],
        },
        {
          date: '2024-09-30', inspectorName: 'M. Okafor',
          generalNotes: 'Multiple violations. Score dropped significantly from prior year.',
          isCritical: false,
          violations: [
            { type: 'Improper food storage',            notes: 'Produce stored directly on floor in walk-in cooler.' },
            { type: 'Food contact surface not sanitized', notes: 'Cutting boards showed heavy scoring and discoloration. Replaced.' },
          ],
        },
      ],
    },
    {
      _id: new ObjectId('74b7c2f8f1d4c3b2f8e4c210'),
      camis: '10000010',
      name: 'Sugar Rush Cafe',
      cuisine: 'Cafe / Desserts',
      priceRange: '$$',
      address: '85 Orchard St, New York, NY 10002',
      waitTime: 10,
      score: 80,
      color: 'yellow',
      location: { type: 'Point', coordinates: [-73.9898, 40.7195] },
      comments: [
        { author: 'liam-johnson', text: 'The desserts here are dangerously good.', date: '2025-03-01' },
        { author: 'emma-smith',   text: 'Their cheesecake is insane.',             date: '2025-03-07' },
        { author: 'john-doe',     text: 'Solid place, hoping the score goes up.',  date: '2025-03-15' },
      ],
      inspections: [
        {
          date: '2025-03-10', inspectorName: 'A. Rivera',
          generalNotes: 'Improved from prior inspection. Two minor violations remain.',
          isCritical: false,
          violations: [
            { type: 'Non-food contact surface improperly constructed', notes: 'Torn gasket on display case refrigerator. Ordered replacement.' },
            { type: 'Lighting insufficient',                           notes: 'Light fixture above prep counter out. Maintenance requested.' },
          ],
        },
        {
          date: '2024-10-22', inspectorName: 'T. Nguyen',
          generalNotes: 'More violations than expected for this type of establishment.',
          isCritical: false,
          violations: [
            { type: 'Food not protected from contamination', notes: 'Uncovered desserts in display window exposed to customer handling area.' },
            { type: 'Improper cooling of cooked foods',      notes: 'Cheesecake cooled in large batches rather than individually. Corrected.' },
          ],
        },
      ],
    },
  ];

  await restaurantCollection.insertMany(restaurantData);

  await restaurantCollection.createIndex({ location: '2dsphere' });
  await restaurantCollection.createIndex({ name: 'text', address: 'text', cuisine: 'text' });

  console.log(`Seeded ${restaurantData.length} restaurants to restaurants collection`);
  console.log('Created 2dsphere and text indexes on restaurants collection');

  await closeConnection();
};

main();


