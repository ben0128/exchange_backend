const bcrypt = require('bcryptjs');


exports.comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
}

exports.generatePassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      })
    })
  })
}