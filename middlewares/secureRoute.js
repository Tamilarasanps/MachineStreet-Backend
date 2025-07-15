const jwt = require("jsonwebtoken");
const User = require("../models/userSIgnUp");
const secureRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const retrivedToken = token.split(" ")[1]; // Extract the token
    const decoded = jwt.verify(retrivedToken, process.env.JWT_SECRET);

    // if (!decoded) {
    //   return res.status(401).json({ error: "Invalid Token" });
    // }
    const user = await User.findById(decoded.id).select("-password"); // current loggedin user
    if (!user) {
      return res.status(401).json({ error: "No user found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in secureRoute: ", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(401).json({ error: "Authentication failed" });
  }
};
module.exports = secureRoute;
