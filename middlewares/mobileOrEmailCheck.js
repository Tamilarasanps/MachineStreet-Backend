const mobileOrEmailCheck = (req, res, next) => {
  const emailRegex =
    /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@gmail\.com$|^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@gmail\.co$/;
  const mobileRegex = /^\d{10}$/;
  const { mailOrphone } = req.body;
  if (!mailOrphone) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!emailRegex.test(mailOrphone) && !mobileRegex.test(mailOrphone)) {
    return res
      .status(400)
      .json({ message: "Enter a valid email or mobile number" });
  }

  req.recipient = emailRegex.test(mailOrphone) ? "email" : "mobile";

  next();
};

module.exports = mobileOrEmailCheck;
