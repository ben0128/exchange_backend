//插入種子資料
const db = require("../../config/mongoose");
const User = require("../user");
const getNextId = require("../../utils/getId");

const createUser = async () => {
  try {
    const userId = await getNextId("userId");
    const newUser = new User({
      id: userId,
      email: "1235@example.com",
      password: "123456",
    });
    console.log('newUser', newUser)
    await newUser.save();
    console.log("seed done");
  } catch (err) {
    console.log("seed error");
  } finally {
    db.close();
  }
};

createUser();
