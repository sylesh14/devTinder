const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(
    "mongodb+srv://sailesh14699:FzQQZz1K4e0DSypX@t4.uiod4hk.mongodb.net/devTinder",
  );
};

module.exports = connectDB;
