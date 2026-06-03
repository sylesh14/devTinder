const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignore", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  },
);

connectionRequestSchema.pre("save", function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("you cannot send connection request to yourself");
  }
});

// compound index - useful for searching full name
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

const connectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = connectionRequest;
