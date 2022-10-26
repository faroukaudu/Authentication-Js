//jshint esversion:6
require('dotenv').config();
const userSchemas = require(__dirname + "/config/mongodb.js");
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require('mongoose-findorcreate');



app.use(bodyParser.urlencoded({extended :true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    //Expire Session after 1min.
    maxAge: 60000
  }
  // cookie: { secure: true }
}));

/////Use and initialze the passport module///////////////////////////////////////////
app.use(passport.initialize());
/////Use and initialze the passport with session module///////////////////////////////////////////
app.use(passport.session());

/////Use and initialze the passport module///////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/userDB");
const UserSche = userSchemas.schema()




// userSchema.plugin(encrypt, {secret: process.env.SECRETKEY, encryptedFields: ['password']});
UserSche.plugin(passportLocalMongoose);
UserSche.plugin(findOrCreate);

//creating an object model
const UserData = mongoose.model("Userauth",UserSche);

passport.use(UserData.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});
// userData.sender();
// passport.use(userData.createStrategy());
//
// passport.serializeUser(userData.serializeUser());
// passport.deserializeUser(userData.deserializeUser());


//////////////////////////GOOGLE STRATEGY/////////////////////////////////////
passport.use(new GoogleStrategy({
  //on env
    clientID: process.env.CLIENTS_ID,
    clientSecret: process.env.CLIENTS_SECRETS,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    //console.log(profile.displayName);
    //create if not found using google display name and profile id from Profile
    UserData.findOrCreate({ username:profile.displayName, googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
//////////////////////////FACEBOOK STRATEGY/////////////////////////////////////
passport.use(new FacebookStrategy({
  //app Id and token on env
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    //creat if not found with facebook if gotten from the profile
    UserData.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//////////////////////////////////Google Passport///////////////////////////////

//populate database with google profile
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
  //////////////////////////////////Google Passport///////////////////////////////
  //////////////////////////////////FACEBOOK/////////////////////////////////////
  app.get('/auth/facebook',
  passport.authenticate('facebook'));

  //facebook login page pop up
  app.get('/auth/facebook/secrets',

  //authenticate using facebook Auth and if failed take to login route
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

//////////////////////////////////FACEBOOK/////////////////////////////////////




app.get("/", function(req, res){

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

//cehcking to login user after checking if data matches on database
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      //authenticate user by assigning a session after data macth
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })

})

////Register////////////////////////////////////////////////
/////--------------------secret--------------------------------///
app.get("/secrets", function(req,res){
//find user where the secret field is NOT NULL
  UserData.find({"secret": {$ne: null}}, function(err, foundSecrets){
    if(err){
      console.log(err);
    }else{
      if(foundSecrets){
        //passing data to EJs HTML template
        res.render("secrets", {allUserSecrets: foundSecrets});
      }
    }
  });
  // if(req.isAuthenticated()){
  //     res.render("secrets");
  // }else{
  //   res.render("login");
  // }
})

/////--------------------secrets--------------------------------///
/////--------------------LOGOUT!!!--------------------------------///
app.get("/logout", function(req,res){
  //logging out a session
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
////Secret MSG////////////////////////////////////////////////
app.get("/submit", function(req, res){


  if(req.isAuthenticated()){
      console.log(req.user.username);
      //console.log(req.user.username);
      res.render("submit");
  }else{
    res.render("login");
  }
});
////////////////POSTPSOTPOST/////////////////////

app.post("/submit", function(req,res){
  const sec_msg = req.body.secret;
  //checking if user is logged in
  if(req.isAuthenticated()){
//find user by ID
    UserData.findById(req.user.id, function(err, foundUser){
      if(err){
        console.log(err);
      }else{
        if(foundUser){
          foundUser.secret = sec_msg;
          //save updated secrets
          foundUser.save(function(){
            res.redirect("/secrets");
          })
        }
      }
    })

  }else{
    res.render("login");
  }







})



////Secret MSG////////////////////////////////////////////////





////Registration route Post////////////////////////////////////////////////

app.post("/register", function(req,res){
UserData.register({username:req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    //Authenticate local using username and password
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
