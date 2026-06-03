const express = require("express");

const requestsRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      if (!["ignore", "interested"].includes(status)) {
        return res.status(400).json({
          message: "invalid status - " + status,
        });
      }

      const userTo = await User.findById(toUserId);
      if (!userTo) {
        return res.status(400).send({
          message: "User not found",
        });
      }

      const isExisting = await connectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (isExisting) {
        return res.status(400).send({
          message: "Connection Request Already Exists!!!",
        });
      }

      const connectionReq = new connectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionReq.save();
      res.json({
        message: "connection request sent",
        data: data,
      });
    } catch (err) {
      res.status(400).send("Request Failed " + err);
    }
  },
);

requestsRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { requestId, status } = req.params;
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({
          message: "invalid status request",
        });
      }

      const connectionReq = await connectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionReq) {
        return res.status(404).json({
          message: "connection request is invalid",
        });
      }
      connectionReq.status = status;

      const data = await connectionReq.save();

      res.json({
        message: "connection request is " + status,
        data,
      });
    } catch (err) {
      res.status(400).send("Request Failed " + err);
    }
  },
);

module.exports = requestsRouter;
