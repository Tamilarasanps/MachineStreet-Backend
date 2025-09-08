const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const LogInRepository = () => ({
  login: async (userDetails) => {
    try {
      const user = await User.findOne({
        $or: [
          { "mobile.number": userDetails.mobile },
          { username: userDetails.mobile },
        ],
      }).lean();
      if (!user) throw new Error("User not found");

      const isMatch = await bcrypt.compare(userDetails.password, user.password);
      if (!isMatch) throw new Error("You entered wrong password");

      const secretKey = process.env.JWT_SECRET;
      const token = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: "90d",
      });
      return {
        token,
        role: user.role,
        userId: user._id,
        message: "LoggedIn Successfully!!",
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  
});

module.exports = LogInRepository;
