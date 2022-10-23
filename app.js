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
    //Expire Session after 30secs.
    expires:30000
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
    clientID: process.env.CLIENTS_ID,
    clientSecret: process.env.CLIENTS_SECRETS,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile.displayName);
    UserData.findOrCreate({ username:profile.displayName, googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
//////////////////////////FACEBOOK STRATEGY/////////////////////////////////////
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    UserData.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//////////////////////////////////Google Passport///////////////////////////////
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

  app.get('/auth/facebook/secrets',
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
    res.render("login");
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
    passport.authenticate("local")(req, resi, function(){
    res.redirect("/secrets");
    });

  }
})

})


////Register////////////////////////////////////////////////


app.listen(3000, function(){
  console.log("listening from port 3000");
});
