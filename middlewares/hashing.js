const bcrypt = require('bcrypt');

const hashing = async (plainPassword) => {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
};
module.exports = hashing;