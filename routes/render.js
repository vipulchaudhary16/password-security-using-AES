const express = require("express");
const router = express.Router();

const LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./token');

router.get("/", (req, res) => {
  const params = {};
  if (localStorage.getItem("token")) {
    res.status(200).render("loggedin_index.html", params);
  } else {
    res.status(200).render("index.html", params);
  }
});

router.get("/signup", (req, res) => {
  const params = {};
  res.status(200).render("signup.html", params);
});

router.get("/login", (req, res) => {
  const params = {};
  res.status(200).render("login.html", params);
});

router.get("/logout", (req, res) => {
  localStorage.removeItem("token");
  res.status(200).redirect("/");
});

module.exports = router;
