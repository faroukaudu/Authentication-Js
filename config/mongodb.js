exports.schema = function(){
  const mongoose = require('mongoose');
  const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    facebookId:String,
    secret:String,
  })

  return UserSchema;
}


//exports.sender = function(){
//
//
//    const express = require('express');
//    const app = express();
//    const mongoose = require('mongoose');
//    const session = require('express-session');
//    const passport = require('passport');
//    const passportLocalMongoose = require('passport-local-mongoose');
//
//    app.use(session({
//      secret: 'keyboard cat',
//      resave: false,
//      saveUninitialized: false,
//      // cookie: { secure: true }
//    }));
//
//    /////Use and initialze the passport module///////////////////////////////////////////
//    app.use(passport.initialize());
//    /////Use and initialze the passport with session module///////////////////////////////////////////
//    app.use(passport.session());
//
//    /////Use and initialze the passport module///////////////////////////////////////////
//    mongoose.connect("mongodb://localhost:27017/userDB");
//
//    const UserSchema = new mongoose.Schema({
//      username: {
//        type: String,
//        required: true
//      },
//      password: String,
//    });
//
//
//    // userSchema.plugin(encrypt, {secret: process.env.SECRETKEY, encryptedFields: ['password']});
//    UserSchema.plugin(passportLocalMongoose);
//
//
//    const UserData = mongoose.model("Userauth",UserSchema);
//
//    passport.use(UserData.createStrategy());
//
//    passport.serializeUser(UserData.serializeUser());
//    passport.deserializeUser(UserData.deserializeUser());
//
//
//
//
// }

// exports.senderTwo =  function (res){
//   let firstname = "Farouk", lastname = "audu";
//
//   let newname = firstname.toUpperCase();
//
//   return {newname, lastname};

// -----------------------------------------------------------------------------
//   res.render("login");
// }
// foo = function (){
//   var text =  "This is foo function";
//   return text;
// }
//
// module.exports = {
//
//
//   cooks: function (){
//     var text2 ="This is cooks functions running";
//     return foo();
//   },
//
//   cooks2: function (){
//     var text2 ="This is cooks functions running";
//     return text2;
//   }

// }
