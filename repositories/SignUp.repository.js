const mobileOtp = require("../middlewares/mobileOtp");
const User = require("../models/user.model");
const Otp = require("../models/Otp.model");
const {
  industry,
  category,
  subCategory,
  brand,
} = require("../models/Industry.model");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const hashing = require("../middlewares/hashing");

const signUpRepo = () => ({
  getIndustry: async () => {
    try {
      const result = {};

      const db = mongoose.connection.db;
      const states = await db
          .collection("states")
          .find({
              _id: {
                  $in: ["6846c228b2a889fa645ef28d", "6846c641b2a889fa645ef28f"],
              },
          })
          .toArray();

      // const { ObjectId } = mongoose.Types;

      // const objectIds = [
      //   new ObjectId("6828db2e5b39026cc95691ca"),
      //   new ObjectId("6828e0fa5b39026cc9569208"),
      // ];

      // const states = await db
      //   .collection("states")
      //   .find({
      //     _id: { $in: objectIds },
      //   })
      //   .toArray();


      async function getItems(model, collectionName, fieldName, identifier) {
        if (!collectionName && !fieldName && model) {
          const industryData = await industry.aggregate([
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
            {
              $group: {
                _id: null,
                names: { $push: "$name" },
              },
            },
          ]);
          if (industryData[0]?.names) {
            result.industry = industryData[0]?.names;
          }
          return;
        }

        const response = await model.aggregate([
          {
            $lookup: {
              from: collectionName,
              localField: fieldName,
              foreignField: "_id",
              as: "value",
            },
          },
          {
            $unwind: {
              path: "$value",
            },
          },
          {
            $group: {
              _id: "$value.name",
              items: { $push: "$name" },
            },
          },
          {
            $project: {
              _id: 0,
              value: "$_id",
              items: { $sortArray: { input: "$items", sortBy: 1 } },
            },
          },
          {
            $sort: {
              value: 1,
            },
          },
        ]);
        if (response?.length) {
          result[identifier] = response;
        }
      }
      await Promise.all([
        getItems(industry),
        getItems(category, "industries", "industry", "category"),
        getItems(subCategory, "categories", "category", "subcategory"),
        getItems(brand, "subcategories", "subCategory", "brand"),
      ]);

      return { industries: result, states: states };
    } catch (err) {
      throw new Error(err);
    }
  },
  sendOtp: async (userDetails, newOtp, page) => {
   
    try {
      let userCheck;

      if (page === "login") {
        // find user by mobile number
        userCheck = await User.findOne({
          "mobile.number": userDetails.mobile,
        });

        if (!userCheck) {
          throw new Error("User not found");
        }
      }

      if (page === "signup") {
        userCheck = await User.findOne({
          $or: [
            {
              username: {
                $regex: `^${userDetails.username.trim()}$`,
                $options: "i",
              },
            },
            { "mobile.number": userDetails.mobile.number },
          ],
        });

        if (userCheck) {
          const matchedField = new RegExp(
            `^${userDetails.username.trim()}$`,
            "i"
          ).test(userCheck.username)
            ? "Username"
            : "Mobile";

          throw new Error(
            matchedField === "Username"
              ? "Username already taken"
              : "Mobile number already registered"
          );
        }
      }

      // select correct source for mobile/countryCode
      const mobileNumber =
        page === "login" ? userCheck.mobile.number : userDetails.mobile.number;
      const countryCode =
        page === "login"
          ? userCheck.mobile.countryCode
          : userDetails.mobile.countryCode;

      // send OTP
      const result = await mobileOtp(mobileNumber, newOtp, countryCode);
      console.log(result)

      if (result) {
      
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await Otp.create({
          mobile: mobileNumber,
          otp: newOtp,
          expiresAt,
        });
      }

      return {result, userId : page==='login' ? userCheck._id : null};
    } catch (err) {
      throw err;
    }
  },
  register: async (userDetails) => {
    try {
      const hashedPassword = await hashing(userDetails.password);
      const userData = { ...userDetails, password: hashedPassword };
      const result = new User(userData);
      const savedUser = await result.save();

      return savedUser.toObject();
    } catch (err) {
      console.log(err);
      throw new Error(err.message || "Failed to register user");
    }
  },
});

module.exports = signUpRepo;
