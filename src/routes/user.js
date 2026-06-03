const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const VALUES_TO_SHOW = "firstName lastName age skills";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionReq = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", ["firstName", "lastName"]);

    res.json({
      message: "fetched data",
      data: connectionReq,
    });
  } catch (err) {
    res.status(400).send("Request Failed " + err);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionReq = await connectionRequest
      .find({
        $or: [
          { fromUserId: loggedInUser._id, status: "accepted" },
          { toUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", ["firstName", "lastName"])
      .populate("toUserId", ["firstName", "lastName"]);

    console.log(connectionReq);

    const data = connectionReq.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      data,
    });
  } catch (err) {
    res.status(400).send("Request Failed " + err);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const connectionReq = await connectionRequest
    .find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
    .select("fromUserId toUserId");

  const hideUsersFromFeed = new Set();
  connectionReq.forEach((req) => {
    hideUsersFromFeed.add(req.fromUserId.toString());
    hideUsersFromFeed.add(req.toUserId.toString());
  });
  console.log(hideUsersFromFeed);

  const users = await User.find({
    $and: [
      { _id: { $nin: Array.from(hideUsersFromFeed) } },
      { _id: { $ne: loggedInUser._id } },
    ],
  })
    .select(VALUES_TO_SHOW)
    .skip(skip)
    .limit(limit);
  res.send(users);
});

module.exports = userRouter;
