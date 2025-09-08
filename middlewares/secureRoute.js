const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const secureRoute = async (req, res, next) => {
    console.log("okkk :", req.cookies?.authToken)
    try {
        let token = req.cookies?.authToken || req.headers.authorization.split(" ")[1];

        if (!token && req?.headers?.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // if (!token) {
        //     throw new Error("Failed to register user");
        //     err.statusCode = 401;
        //     throw err;
        // }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            const err = new Error("Unauthorized access - user not found");
            err.statusCode = 401;
            throw err;
        }

        req.userId = decoded.userId;
        req.role = user.role;
        req.qr = user.qr
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized Please Login" });
    }
};

module.exports = secureRoute;
