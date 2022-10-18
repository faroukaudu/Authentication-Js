
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: String,
});



// userSchema.plugin(encrypt, {secret: process.env.SECRETKEY, encryptedFields: ['password']});


module.exports = mongoose.model("Userauth",userSchema);
// module.exports = "Mogodb is running";
