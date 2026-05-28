const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json());

app.patch("/userupdate/:userID", async (req, res) => {
  const userId = req.params?.userID;
  const data = req.body;

  const before = await User.findByIdAndUpdate({ _id: userId }, data, {
    returnDocument: "before",
    runValidators: true,
  });
  console.log("data before ", before);

  res.send("user updated");
});

app.delete("/deleteuser", async (req, res) => {
  const userId = req.body.userId;

  await User.findByIdAndDelete(userId);

  res.send("user deleted successfully");
});

app.get("/feed", async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

app.get("/user", async (req, res) => {
  const userMail = req.body.emailId;

  const users = await User.find({ emailId: userMail });

  res.send(users);
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      res.send("logged in successfully");
    } else {
      throw new Error("Invalid Email Id or Password");
    }
  } catch (err) {
    res.status(500).send("Request Failed " + err);
  }
});

app.post("/signup", async (req, res) => {
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

    await user.save();
    res.send("User Added");
  } catch (err) {
    res.status(500).send("Request Failed " + err);
  }
});

connectDB()
  .then(() => {
    console.log("database is connected..");
    app.listen(3000, () => {
      console.log("server is listening...");
    });
  })
  .catch((err) => {
    console.error("database connection is not established..", err);
  });
