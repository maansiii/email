//jshint esversion:6
require('dotenv').config();
const nodemailer= require("nodemailer");
const express = require("express");
const bodyParser = require("body-parser");
const ejs =  require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const sendMail = require('./mail');
const path = require('path')



const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/useresDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    googleId: String,
    useremail: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dashboard",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
    res.render("login");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));

app.get("/auth/google/dashboard", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/forgotp", function(req, res){
  res.render("forgotp");
});

app.get("/dashboard", function(req, res){
    res.render("dashboard")
});

app.get("/create", function(req, res){
  res.render("create")
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/login");
});

app.post("/register", function(req, res){
    
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/dashboard");
            });
        }
    });
});

app.post("/create", function(req, res){
    
});

app.post("/forgotp", function(req, res){
  
})

app.post("/login", function(req, res){
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
       if(err){
          console.log(err);
          res.redirect("/login");
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/dashboard");
            });
        }
    });
});



app.post('/email', (req,res) =>{
	const {subject,email,text}=req.body;
	console.log('Data: ',req.body);
	sendMail(email,subject,text, function(err,data){
		if (err){
			res.status(500).json({message:'Internal Error'});
		} else{
			res.json({message:'Sent'});
		}
	});
});

app.listen(3000, function(){
    console.log("Server started at port 3000");
});