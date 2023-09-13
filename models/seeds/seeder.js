//插入種子資料

const db = require('../../config/mongoose')
const User = require('../user')

const newUser = new User({
  email: 'example@eple.com',
  password: '12345678'
})

newUser.save().then(user => {
  console.log('user created!')
  db.close()
}).catch(err => {
  console.log(err)
  db.close()
})
