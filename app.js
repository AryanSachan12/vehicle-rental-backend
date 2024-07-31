const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const Booking = require("./models/Booking");
const Listings = require("./models/Listings");
require("dotenv").config();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "fu8ej1djasodj912h1823y1hs231";

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);

async function getUserDataFromToken(req) {
  return new Promise((resolve, reject) => {
    if (req.cookies.token) {
      jwt.verify(req.cookies.token, jwtSecret, {}, async (error, userData) => {
        if (error) throw error;
        resolve(userData);
      });
    }
  });
}

//mongo db connection
mongoose.connect(process.env.MONGO_URI);

//routes
app.post("/register", async (req, res) => {
  const data = req.body;

  const hashedCreatePassword = await bcrypt.hash(data.password, 10);

  try {
    const userDoc = await User.create({
      ...data,
      password: hashedCreatePassword,
    });

    res.status(201).json({ success: true, body: userDoc });
  } catch (error) {
    res.status(409).json({ success: false, message: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const UserDoc = await User.findOne({ email });
  if (UserDoc) {
    const passOk = bcrypt.compareSync(password, UserDoc.password);

    if (passOk) {
      jwt.sign(
        { userName: UserDoc.userName, email: UserDoc.email, id: UserDoc._id },
        jwtSecret,
        {},
        (error, token) => {
          if (error) throw error;

          return res
            .status(200)
            .cookie("token", token)
            .json({ ...UserDoc, password: "encrypted" });
        }
      );
    } else {
      return res.status(422).json("pass not ok");
    }
  } else {
    res.status(404).json("not found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
      if (error) throw error;
      const { _doc: userDoc } = await User.findById(userData.id);

      return res.json({ ...userDoc, password: "encrypted" });
    });
  } else {
    return res.json(null);
  }
});

app.post("/bookings", async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { name, startDate, endDate } = req.body;

    // Verify the JWT token
    const userData = jwt.verify(token, jwtSecret);

    // Create the booking
    const booking = await Booking.create({
      name,
      startDate,
      endDate,
      user: userData.id, // Assuming you want to link the booking to the user
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/bookings", async (req, res) => {
  const userData = await getUserDataFromToken(req);
  const bookings = await Booking.find({ user: userData.id });

  res.status(200).json(bookings);
});

app.get("/listings", async (req, res) => {
  const carListings = await Listings.find({});
  res.status(200).json(carListings);
});

//server information
const port = 4000;

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}...`);
});
