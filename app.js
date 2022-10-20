//jshint esversion:6
require('dotenv').config();
const userData = require(__dirname + "/config/mongodb.js");
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();
app.use(bodyParser.urlencoded({extended :true}));
app.use(express.static("public"));
app.set("view engine", "ejs");



app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}));

/////Use and initialze the passport module///////////////////////////////////////////
app.use(passport.initialize());
/////Use and initialze the passport with session module///////////////////////////////////////////
app.use(passport.session());

/////Use and initialze the passport module///////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/userDB");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: String,
});


// userSchema.plugin(encrypt, {secret: process.env.SECRETKEY, encryptedFields: ['password']});
UserSchema.plugin(passportLocalMongoose);


const UserData = mongoose.model("Userauth",UserSchema);



// mongoose.connect("mongodb://localhost:27017/userDB");
//
// const userSchema = new mongoose.Schema({
//   name: {
//     type:String,
//     required: true,
//   },
//   password: String,
// })
//
// const userModel = mongoose.model("Userdata", userSchema);
passport.use(UserData.createStrategy());

passport.serializeUser(UserData.serializeUser());
passport.deserializeUser(UserData.deserializeUser());


app.get("/", function(req, res){
  //userData.senderTwo(res);

  res.render("home");
})
////lOGIN////////////////////////////////////////////////
app.get("/login", function(req,res){
  res.render("login");
})
////login- POST////////////////////////////////////////////////
app.post("/login", function(req,res){
  const user = new UserData({
    username:req.body.username,
    password:req.body.password
  });


  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })

})

////Register////////////////////////////////////////////////
/////--------------------secret--------------------------------///
app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.render("login")
  }
})

/////--------------------secrets--------------------------------///
/////--------------------LOGOUT!!!--------------------------------///
app.get("/logout", function(req,res){
  req.logout(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect('/login');
    }
  })
})

/////--------------------LOGOUT!!!--------------------------------///



////Register////////////////////////////////////////////////
app.get("/register", function(req,res){
  res.render("register");

})

////POST---Register////////////////////////////////////////////////


app.post("/register", function(req,res){
UserData.register({username:req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req, res, function(){
    res.redirect("/secrets");
    });

  }
})

})


////Register////////////////////////////////////////////////


app.listen(3000, function(){
  console.log("listening from port 3000");
});
