const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware')
const path = require("path");
const port = 3000;

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
app.use(requireAuth);


// routes

app.use(authRoutes);


app.get('*', checkUser);
app.get("/", (req, res) => {
  res.render("login");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/createjob", (req, res) => {
  res.render("createjob");
});
app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});
app.get("/profile", (req, res) => {
  res.render("profile");
});
app.get("/job", (req, res) => {
  res.render("job");
});

app.get('*', checkUser)
app.get('/', (req, res) => res.render('login', { user: req.user }))
app.get('/profile',  requireAuth, (req, res) => res.render('profile'))
app.get('/dashboard',  requireAuth)
app.get('/editjob',  requireAuth)
app.get('/register',  (req, res) => res.render('register'))

// database connection

const dbURI =
"mongodb+srv://beayman35:rigmC9v8rATam6v3@cluster0.ewewown.mongodb.net/jobApply";

mongoose
.connect(dbURI)
.then((result) => app.listen(port))
.catch((err) => console.log(err));


