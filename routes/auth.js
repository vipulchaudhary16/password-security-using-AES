const express = require("express");
const router = express.Router();
const Signup = require("../models/signup");
const { encrypt, decrypt } = require("../Modules/AES.js");

const LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./token');

//configuting the dotenv
const dotenv = require('dotenv');
dotenv.config();

//key for AES encryption
const key = process.env.AES_KEY

router.post("/signup", async (req, res) => {
  try {
    const user = new Signup({
      name: req.body.name,
      email: req.body.email,
      password: encrypt(req.body.password, key , 256),
    });
    console.log(user);
    const userRegistered = await user.save();
    res.status(201).redirect("/login");
  } catch (err) {
    //TODO - Shows error to user
    res.status(404).send({message: "Internal Server Error"});
  }
});

router.post("/login", async (req, res) => {
  try {
    const mail = req.body.email;
    const password = req.body.password;
    Signup.findOne({ email: mail }, function (err, foundUser) {
      if (err) {
        res.status(400).send(err);
      } else {
        if(foundUser){
          const encPass = foundUser.password;
          const decPass = decrypt(encPass, key, 256);
          if (decPass === password) {
            localStorage.setItem("token", foundUser._id);
            res.status(201).redirect("/");
          } else {
            res.status(403).send({message: "Incorrect Password!!"});
          }
        } else {
          res.status(404).send({message: "This email is not registered!!"});
        }
      }
    });
  } catch (err) {
    //TODO - Shows error to user
    res.status(400).send(err);
    console.log(err);
  }
});

module.exports = router;