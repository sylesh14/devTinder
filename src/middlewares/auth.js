const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("pls login");
    }
    const decodedMsg = await jwt.verify(token, "DEV@TINDER790");
    const { _id } = decodedMsg;
    const user = await User.findById(_id);

    if (!user) {
      throw new Error("user not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Request Failed " + err);
  }
};

module.exports = { userAuth };
