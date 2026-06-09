const express = require("express");

const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validation");

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      });
      res.send(user);
    } else {
      throw new Error("Invalid Email Id or Password");
    }
  } catch (err) {
    res.status(500).send("Request Failed " + err);
  }
});

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    // creating a new instance of a user model
    const { firstName, lastName, emailId, password } = req.body;
    passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({ message: "User Added", data: savedUser });
  } catch (err) {
    res.status(500).send("Request Failed " + err);
  }
});

authRouter.post("/logout", (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logged Out Successfully");
});

module.exports = authRouter;
