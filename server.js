const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

// const cors = require("cors");

require("dotenv").config();

//middlwares
const connect = require("./db");
const signup = require("./controllers/signUp");
const login = require("./controllers/login");
const adminCategories = require("./controllers/Admin/categoryCreation");
const homepage = require("./controllers/Client/HomePage");
const categoryPage = require("./controllers/Client/Industry");
const sell = require("./controllers/sell");
const productPageRoute = require("./routes/ProductPageRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const landinPage = require("./routes/LandingPage.js");
const productDetailRoutes = require("./routes/productDetails.js");
const AdminProduct = require("./routes/AdminProduct.js");
const profilePage = require("./routes/profileRoutes.js");
const qrRoute = require("./routes/qrRoute.js");
const secureRoute = require("./middlewares/secureRoute.js");
const wishlist = require("./routes/wishList.js");
const video = require("./routes/video.js");
const mechanicRoutes = require("./routes/mechanicRoutes");
const search = require("./controllers/Client/SearchController.js");
const supportTicket = require("./controllers/Client/supportTicket.js");
const geo = require('./middlewares/geocoords.js')
const axios = require("axios");

const messageRoute = require("./routes/messageRoute.js");
const { app, server } = require("./socket/server.js");

//express setup

// const allowedOrigins = ["https://machinestreets.com","https://faceqrapp.netlify.app","https://api.machinestreets.com",
//   "http://192.168.1.8:5000","http://localhost:8081","http://192.168.1.9:5000"
// ];
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) callback(null, true);
//     else callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
// }));
// app.options("*", cors()); // handles preflight requests


// app.use(cors({ origin: '*' }));
// const rateLimit = require("express-rate-limit");

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, 
//   message: "Too many requests from this IP, please try again later.",
//   standardHeaders: true,
//   legacyHeaders: false, 
// });


app.use(helmet());
app.use(express.json()); // Parses JSON request body
app.use(express.urlencoded({ extended: true })); // Parses form data
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use(cookieParser());
// app.use(limiter); // Apply to all routes

app.get("/api/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

//connections
connect(); //mongo

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use((req, res, next) => {
  const originUrl = req.get("Origin") || req.get("Referer"); // If 'Origin' is not available, fallback to 'Referer'
  console.log(`Request made from: ${originUrl}`);
  next();
});

// routes
app.use("/signup", signup);
app.use("/login", login);
app.use("/adminCategories", adminCategories);
app.use("/productupload", secureRoute, sell);
app.use("/homepage", homepage);
app.use("/categories", categoryPage); //need to change
// app.use("/api/chat", require("./controllers/chat"));
app.use("/message", messageRoute);
app.use("/productPage", productPageRoute);
app.use("/CategoryPage", categoryRoutes);
app.use("/productDetails", productDetailRoutes);
app.use("/QrGenerator", qrRoute);
app.use("/profile", profilePage);
app.use("/adminApproval", AdminProduct);
app.use("/wishlist", wishlist);
app.use("/video", video);
app.use("/mechanicList", mechanicRoutes);
app.use("/searchResult", search);
app.use("/supportTicket", supportTicket);
app.use("/landingPage", landinPage);
app.use("/geocoords",geo)

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`server listening on Port ${PORT}`);
});

// hhhhh
