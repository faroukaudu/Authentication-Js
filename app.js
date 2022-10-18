//jshint esversion:6
require('dotenv').config();
const UserData = require(__dirname + "/config/mongodb.js");
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const bcrypt = require('bcrypt')
// const md5 = require('md5');
// const mongoose = require('mongoose');
const saltRounds = 10;


const app = express();
app.use(bodyParser.urlencoded({extended :true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

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



app.get("/", function(req, res){

  res.render("home");
})
////lOGIN////////////////////////////////////////////////
app.get("/login", function(req,res){
  res.render("login");
})
////login- POST////////////////////////////////////////////////
app.post("/login", function(req,res){
  const loginPassword = req.body.password;

  UserData.findOne({name:req.body.username}, function(err, foundResult){
    if(err){
      console.log(err);
    }else if(foundResult){
    bcrypt.compare(loginPassword,foundResult.password, function(err,result){
      if(result === true){
        res.render("secrets");
      }
    })


    }
  })
})

////Register////////////////////////////////////////////////
/////----------------------------------------------------///
////Register////////////////////////////////////////////////
app.get("/register", function(req,res){
  res.render("register");
})

////POST---Register////////////////////////////////////////////////

app.post("/register", function(req,res){
  const regPassword = req.body.username;
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
      const addData = UserData({
        name:req.body.username,
        password: hash,
      });
      addData.save(function(err){
        if(!err){
          res.render("secrets");
        }
      });

  })

})


////Register////////////////////////////////////////////////


app.listen(3000, function(){
  console.log("listening from port 3000");
});
