import { Router } from "express";
import {
  getUserProfile,
  updateUserInfo,
  getUserByUsername,
} from "../../services/userService.js";
import { authenticate, redirectToLanding } from "../../middleware/auth.js";
import validation from "../../helpers.js";
import multer from "multer";
import { ObjectId } from "mongodb";
import { getdb } from "../../database/db.js";
import {
  getFriends,
  removeUserFromFriendsList,
  addUserToFriendsList,
  addUserToBlockedList,
  isUserBlocked,
} from "../../services/friendsService.js";

/*when we are  blocked, (ie. our id shows up in someone elses blocked list ),
2. That user will show up in our saerch results, but we cannot access their profile page 

when we block a user, 
1. that user cannot show up in our search bar
2. that user cannot access our profile page (blocked by user) or block us (since they can't access our profile page, they can't block us from there, and we can just ignore any block requests from them since we have already blocked them)
*/

const router = Router();

//https://www.npmjs.com/package/multer instead of relying on amazon s3 buckets for external storage of pictures, we can use multer to handle file uploads and store them locally on the server.
//This is a simpler solution for development and testing purposes, and can be easily switched to a cloud storage solution in the future if needed.
//creating a storage object for multer to specify where to store uploaded files and how to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/uploads/profilePhotos");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage: storage, //specifying the storage object we just created
});

/**
 * @route GET /api/users/profile
 * @desc Get the authenticated user's profile information, including their posts and reviews.
 * @access Private (Authenticated users only)
 * @returns {Object} User profile data with recent posts and reviews.
 * @example
 * GET /api/users/profile
 */

router.get("/profile", authenticate, async (req, res, next) => {
  try {
    const userId = req.session.member.userId; // Extract userId from the authenticated token
    if (!userId) {
      return res.status(400).json({ error: "invalid User Id" });
    }
    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: "user not found" });
    }
    res.status(200).render("profile", {
      title: "BiteCheck: Profile",
      username: profile.username,
      firstName: profile.firstName, //user starts without a first or last name, but can update it
      lastName: profile.lastName, //user starts without a first or last name, but can update it
      email: profile.email,
      profilePhoto: profile.profilePhoto,
      favRestaurants: profile.favRestaurants,
      status: profile.status,
      appSearchRadiusMeters: profile.appSearchRadiusMeters,
      age: profile.age,
      recentPosts: profile.stats.posts,
      hasRestaurants: profile.stats.posts.length > 0,
      recentReviews: profile.stats.recentReviews,
    });
  } catch (e) {
    next(e);
  }
});

router
  .route("/profile/edit")
  .get(authenticate, async (req, res, next) => {
    //this renders the edit profile page which loads the form in the handlebars
    try {
      const userId = req.session.member.userId; // Extract userId from the authenticated token
      if (!userId) {
        return res.status(400).json({ error: "invalid User Id" });
      }
      const profile = await getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({ error: "user not found" });
      }
      res.status(200).render("profile_edit", {
        title: "BiteCheck: Edit Profile",
        username: profile.username,
        firstName: profile.firstName, //user starts without a first or last name, but can update it
        lastName: profile.lastName, //user starts without a first or last name, but can update it
        email: profile.email,
        age: profile.age,
        profilePhoto: profile.profilePhoto,
        favRestaurants: profile.favRestaurants,
        status: profile.status,
        appSearchRadiusMeters: profile.appSearchRadiusMeters,
      });
    } catch (e) {
      next(e);
    }
  })
  .post(authenticate, upload.single("profilePhoto"), async (req, res, next) => {
    //funcitonality to update user profile info, not currently used but may be in the future.

    try {
      const userId = req.session.member.userId;
      if (!userId) return res.status(400).json({ error: "invalid User Id" });

      let { firstName, lastName, status, appSearchRadiusMeters } = req.body;

      const updateData = {};
      if (firstName) updateData.firstName = firstName.trim();
      if (lastName) updateData.lastName = lastName.trim();
      if (status && ["Public", "Private"].includes(status))
        updateData.status = status;
      if (appSearchRadiusMeters)
        updateData.appSearchRadiusMeters = parseInt(appSearchRadiusMeters);
      if (req.file)
        updateData.profilePhoto = `/uploads/profilePhotos/${req.file.filename}`;

      await updateUserInfo(userId, updateData);

      req.session.message = "Profile updated successfully!";
      res.status(200).redirect("/api/users/profile");
    } catch (e) {
      next(e);
    }
  });

/**
 * @route GET /api/users/me
 * @desc Returns current user including saved filter preference
 * @access Private
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const db = getdb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.session.member.userId) },
      {
        projection: {
          filterPref: 1,
          favRestaurants: 1,
          appSearchRadiusMeters: 1,
        },
      },
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      filterPref: user.filterPref || "all",
      favRestaurants: user.favRestaurants || [],
      appSearchRadiusMeters: user.appSearchRadiusMeters || 1500,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * @route PATCH /api/users/filter-pref
 * @desc Save the user's traffic light filter preference
 * @access Private
 */
router.patch("/filter-pref", authenticate, async (req, res, next) => {
  try {
    const db = getdb();
    const { filterPref } = req.body;
    const allowed = ["all", "green", "yellow", "red"];

    if (!allowed.includes(filterPref)) {
      return res.status(400).json({ error: "Invalid filter preference" });
    }

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.session.member.userId) },
        { $set: { filterPref } },
      );

    res.status(200).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// GET /api/users/profile/edit — render the edit form
router.get("/profile/edit", authenticate, async (req, res, next) => {
  try {
    const userId = req.session.member.userId;
    const profile = await getUserProfile(userId);

    if (!profile) return res.status(404).json({ error: "User not found" });

    res.status(200).render("profile_edit", {
      title: "BiteCheck: Edit Profile",
      firstName: profile.firstName,
      lastName: profile.lastName,
      status: profile.status,
      appSearchRadiusMeters: profile.appSearchRadiusMeters,
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/users/profile/edit — handle the form submission
router.post(
  "/profile/edit",
  authenticate,
  upload.single("profilePhoto"),
  async (req, res, next) => {
    try {
      const userId = req.session.member.userId;
      let { firstName, lastName, status, appSearchRadiusMeters } = req.body;

      const updateData = {};
      if (firstName) updateData.firstName = firstName.trim();
      if (lastName) updateData.lastName = lastName.trim();
      if (status && ["Public", "Private"].includes(status))
        updateData.status = status;
      if (appSearchRadiusMeters)
        updateData.appSearchRadiusMeters = parseInt(appSearchRadiusMeters);
      if (req.file)
        updateData.profilePhoto = `/uploads/profilePhotos/${req.file.filename}`;

      await updateUserInfo(userId, updateData);

      req.session.message = "Profile updated successfully!";
      res.status(200).redirect("/api/users/profile");
    } catch (e) {
      next(e);
    }
  },
);

router.route("/profile/:id").get(authenticate, async (req, res, next) => {
  //this renders other users profiles, which is the same as the authenticated user's profile but without the option to edit the profile or see recent posts and reviews (for privacy reasons)
  try {
    const userId = req.params.id; // Extract userId from the route parameter
    if (!userId) {
      return res.status(400).json({ error: "invalid User Id" });
    }
    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: "user not found" });
    }
    if (profile.status === "Private") {
      req.session.message =
        "User profile is private. You cannot view this profile's information.";
      return res.status(403).redirect("/api/users/friends"); //if the user has set their profile to private, we don't want to show any of their information to other users, so we just redirect to the home page (could also render an error page that says "This profile is private" or something like that)
    }
    const fromCommunityPulse = req.query.from === "communitypulse";
    return res.status(200).render("profile_other", {
      title: `BiteCheck: ${profile.username}'s Profile`,
      username: profile.username,
      firstName: profile.firstName, //user starts without a first or last name, but can update it
      lastName: profile.lastName, //user starts without a first or last name, but can update it
      email: profile.email,
      profilePhoto: profile.profilePhoto,
      favRestaurants,
      status: profile.status,
      appSearchRadiusMeters: profile.appSearchRadiusMeters,
      age: profile.age,
      fromCommunityPulse: fromCommunityPulse,
      recentPosts: profile.stats.posts,
      hasRestaurants: profile.stats.posts.length > 0,
      recentReviews: profile.stats.recentReviews,
    });
  } catch (e) {
    next(e);
  }
});

router.route("/friends").get(authenticate, async (req, res, next) => {
  try {
    const userId = req.session.member.userId;
    const friends = await getFriends(userId);
    //friend only consists of a string userId, so we have to fetch the details per user we map through (which is asynchronous)
    const friendProfiles = await Promise.all(
      friends.map(async (friendId) => {
        const profile = await getUserProfile(friendId);
        if (!profile) return null;
        return {
          _id: profile._id,
          username: profile.username,
          profilePhoto: profile.profilePhoto,
          profileLink: `/api/users/profile/${profile._id.toString()}`,
          blockLink: `/api/users/block/${profile._id.toString()}`,
          removeLink: `/api/users/remove/${profile._id.toString()}`,
        };
      }),
    );
    //delete all friends that were not found (like if a user is in the friends list but their account was deleted, we don't want to show them on the friends page)
    const filteredFriends = friendProfiles.filter((friend) => friend !== null);

    res.status(200).render("friends", {
      title: "BiteCheck: Friends",
      friends: filteredFriends, //for each friend, we want to display their username, profile photo, and a link to their profile page (which we can create in the future)
    });
  } catch (e) {
    next(e);
  }
});

router.route("/friends/search").get(authenticate, async (req, res, next) => {
  try {
    const usernameQuery = req.query.username.trim();
    if (!usernameQuery) {
      return res.status(400).render("error", {
        statusCode: 400,
        error: "username query parameter is required",
        lastPageRoute: "/api/users/friends",
      });
    }
    if (usernameQuery === req.session.member.username) {
      return res.status(400).render("error", {
        statusCode: 400,
        error:
          "You cannot search for yourself. Please enter a different username to search.",
        lastPageRoute: "/api/users/friends",
      });
    }
    const matchingUsers = await getUserByUsername(usernameQuery);
    const friends = await getFriends(req.session.member.userId);
    const searchResults = await Promise.all(
      matchingUsers.map(async (user) => {
        const blockedByMe = await isUserBlocked(
          req.session.member.userId,
          user._id.toString(),
        );
        const blockedMe = await isUserBlocked(
          user._id.toString(),
          req.session.member.userId,
        );
        if (blockedByMe || blockedMe) {
          //if the user blocks me or i block the user, we don't want to show them in the search
          return null;
        }
        return {
          _id: user._id,
          username: user.username,
          profilePhoto: user.profilePhoto,
          profileLink: `/api/users/profile/${user._id.toString()}`,
          addLink: `/api/users/add/${user._id.toString()}`,
          blockLink: `/api/users/block/${user._id.toString()}`,
          isFriend: friends.includes(user._id.toString()),
        };
      }),
    );
    const filteredSearchResults = searchResults.filter(
      (user) => user !== null && user.username !== req.session.member.username,
    );

    res.status(200).render("friends", {
      title: `BiteCheck: Search Results for "${usernameQuery}"`,
      searchResults: filteredSearchResults,
      fromSearch: true,
      friends: await Promise.all(
        friends.map(async (friendId) => ({
          //for each friend, we want to display their username, profile photo, and a link to their profile page (which we can create in the future)
          _id: friendId,
          username: await getUserProfile(friendId).then((profile) =>
            profile ? profile.username : "Unknown User",
          ),
          profilePhoto: await getUserProfile(friendId).then((profile) =>
            profile ? profile.profilePhoto : null,
          ),
          profileLink: `/api/users/profile/${friendId.toString()}`,
          removeLink: `/api/users/remove/${friendId.toString()}`,
          blockLink: `/api/users/block/${friendId.toString()}`,
        })), // exclude any friends who have blocked us from showing up in our friends list (already happens since we remove the user from our friends list) .filter(user => !isUserBlocked(user._id.toString(),req.session.member.userId))
      ),
    });
  } catch (error) {
    next(error);
  }
});

router.route("/remove/:id").get(authenticate, async (req, res, next) => {
  //even though this is a PATCH operation, i dont feel like making a request modify middleware
  try {
    const userId = req.params.id; // Extract userId from the route parameter
    if (!userId) {
      return res.status(400).json({ error: "invalid User Id" });
    }
    const profile = await getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: "user not found" });
    }
    let updatedFriendsList;
    try {
      updatedFriendsList = await removeUserFromFriendsList(
        req.session.member.userId,
        userId,
      );
      //remove the friend from our user, and remove our user from the friend (since it's a mutual friendship)
      await removeUserFromFriendsList(userId, req.session.member.userId);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to add friend. Please try again later." });
    }

    const friends = await getFriends(req.session.member.userId);
    return res.status(200).render("friends", {
      title: "BiteCheck: Friends",
      friends: await Promise.all(
        friends.map(async (friendId) => ({
          //for each friend, we want to display their username, profile photo, and a link to their profile page (which we can create in the future)
          _id: friendId,
          username: await getUserProfile(friendId).then((profile) =>
            profile ? profile.username : "Unknown User",
          ),
          profilePhoto: await getUserProfile(friendId).then((profile) =>
            profile ? profile.profilePhoto : null,
          ),
          profileLink: `/api/users/profile/${friendId.toString()}`,
          removeLink: `/api/users/remove/${friendId.toString()}`,
          blockLink: `/api/users/block/${friendId.toString()}`,
        })),
      ),
    });
  } catch (e) {
    next(e);
  }
});

router.route("/add/:id").get(authenticate, async (req, res, next) => {
  //even though this is a PATCH operation, i dont feel like making a request modify middleware
  try {
    const userId = req.params.id; // Extract userId from the route parameter
    if (!userId) {
      return res.status(400).json({ error: "invalid User Id" });
    }
    const profile = await getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: "user not found" });
    }
    let updatedFriendsList;
    try {
      updatedFriendsList = await addUserToFriendsList(
        req.session.member.userId,
        userId,
      );
      //add our user the friend, and add the friend to our user (since it's a mutual friendship)
      //IN THE FUTURE WE WILL IMPLEMENT FRIEND REQUESTS, SO THIS AUTOMATIC MUTUAL FRIENDSHIP WILL ONLY HAPPEN ONCE THE OTHER USER ACCEPTS OUR FRIEND REQUEST
      await addUserToFriendsList(userId, req.session.member.userId);
    } catch (error) {
      return res.status(500).render("error", {
        statusCode: 500,
        error: `${error}.Unable to add friend.`,
        lastPageRoute: "/api/users/friends",
      });
    }

    if (!updatedFriendsList) {
      return res
        .status(500)
        .json({ error: "Failed to add friend. Please try again later." });
    }
    const friends = await getFriends(req.session.member.userId);
    return res.status(200).render("friends", {
      title: "BiteCheck: Friends",
      friends: await Promise.all(
        friends.map(async (friendId) => ({
          //for each friend, we want to display their username, profile photo, and a link to their profile page (which we can create in the future)
          _id: friendId,
          username: await getUserProfile(friendId).then((profile) =>
            profile ? profile.username : "Unknown User",
          ),
          profilePhoto: await getUserProfile(friendId).then((profile) =>
            profile ? profile.profilePhoto : null,
          ),
          profileLink: `/api/users/profile/${friendId.toString()}`,
          removeLink: `/api/users/remove/${friendId.toString()}`,
          blockLink: `/api/users/block/${friendId.toString()}`,
        })),
      ),
    });
  } catch (e) {
    next(e);
  }
});

router.route("/block/:id").get(authenticate, async (req, res, next) => {
  //even though this is a PATCH operation, i dont feel like making a request modify middleware
  try {
    const userId = req.params.id.trim(); // Extract userId from the route parameter
    if (!userId) {
      return res.status(400).json({ error: "invalid User Id" });
    }
    const profile = await getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: "user not found" });
    }
    let updatedBlockedList;
    try {
      //their user id is added to our blocked list only
      updatedBlockedList = await addUserToBlockedList(
        req.session.member.userId,
        userId,
      );
    } catch (error) {
      return res.status(500).render("error", {
        statusCode: 500,
        error: `${error}.Unable to block user.`,
        lastPageRoute: "/api/users/friends",
      });
    }
    if (!updatedBlockedList) {
      return res
        .status(500)
        .json({ error: "Failed to block user. Please try again later." });
    }

    let friends = await getFriends(req.session.member.userId);
    let result;
    if (friends.includes(userId)) {
      result = await removeUserFromFriendsList(
        req.session.member.userId,
        userId,
      ); //if the blocked user is in the authenticated user's friends list, we want to remove them from the friends list since they are now blocked
      await removeUserFromFriendsList(userId, req.session.member.userId); //remove us from the blocked user's friends list as well (since they are now blocked, they shouldn't be able to see us as a friend either)
      if (!result) {
        throw new Error(
          "Failed to update friends list after blocking user. Please try again later.",
        );
      }
    }

    //query friends again after the potential removal
    friends = await getFriends(req.session.member.userId);

    req.session.message =
      "User has been blocked. You will no longer see this user in search results";
    return res.status(200).redirect("/api/users/friends"); //after blocking a user, we just redirect to the friends page and show a message that the user has been blocked and will no longer show up in search results (since we filter out blocked users from search results)
    // return res.status(200).render("friends",{
    //     title: "BiteCheck: Friends",
    //     friends: await Promise.all (
    //      friends.map( async friendId => ({ //for each friend, we want to display their username, profile photo, and a link to their profile page (which we can create in the future)
    //         _id: friendId,
    //         username : await getUserProfile(friendId).then(profile => profile ? profile.username : "Unknown User"),
    //         profilePhoto: await getUserProfile(friendId).then(profile => profile ? profile.profilePhoto : null),
    //         profileLink: `/api/users/profile/${friendId.toString()}`,
    //         removeLink: `/api/users/remove/${friendId.toString()}`,
    //         blockLink: `/api/users/block/${friendId.toString()}`,
    //     }))),
    // });
  } catch (e) {
    next(e);
  }
});

// POST /api/users/favorites/:restaurantId
router.post(
  "/favorites/:restaurantId",
  authenticate,
  async (req, res, next) => {
    try {
      const db = getdb();
      await db.collection("users").updateOne(
        { _id: new ObjectId(req.session.member.userId) }, // ← fix
        { $addToSet: { favRestaurants: req.params.restaurantId } },
      );
      res.json({ message: "Added to favorites" });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/users/favorites/:restaurantId
router.delete(
  "/favorites/:restaurantId",
  authenticate,
  async (req, res, next) => {
    try {
      const db = getdb();
      await db.collection("users").updateOne(
        { _id: new ObjectId(req.session.member.userId) }, // ← fix
        { $pull: { favRestaurants: req.params.restaurantId } },
      );
      res.json({ message: "Removed from favorites" });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
