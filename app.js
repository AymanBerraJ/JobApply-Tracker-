const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const path = require("path");
const port = 3000;
// const ftp = require('ftp');
// const fileUpload = require('express-fileupload');

// import ejs
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static(path.join(__dirname, "public")));

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.user = req.user || null; // Assigner l'utilisateur localement à res.locals.user
  next();
});

app.get('*', checkUser);

// routes sans authentification requise
app.use(authRoutes);

app.get("/", (req, res) => {
  res.render("login");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

// routes nécessitant authentification
app.get('/profile', requireAuth, (req, res) => res.render('profile'));
app.get('/dashboard', requireAuth, (req, res) => res.render('dashboard'));
app.get('/createjob', requireAuth, (req, res) => res.render('createjob'));
app.get('/editjob', requireAuth, (req, res) => res.render('editjob'));

// database connection
const dbURI = "mongodb+srv://beayman35:rigmC9v8rATam6v3@cluster0.ewewown.mongodb.net/jobApply";

mongoose
  .connect(dbURI)
  .then((result) => app.listen(port))
  .catch((err) => console.log(err));
