const bcrypt = require("bcryptjs");

exports.comparePassword = (password, hashedPassword) => {
  const result = bcrypt.compareSync(password, hashedPassword);
  return result
};

// 產生隨機密碼
exports.generatePassword = () => {
  const randomPassword = Math.random().toString(36).slice(-8);
  return randomPassword;
};

// 將密碼雜湊
exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  });
};
