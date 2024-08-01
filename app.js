const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')
// const authRoutes = require("./routes/authRoutes");
// const { requireAuth, checkUser } = require("./middleware/authMiddleware");
const port = 3000;

// import ejs
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static(path.join(__dirname, "public")));

// database connection

const dbURI =
  "mongodb+srv://beayman35:rigmC9v8rATam6v3@cluster0.ewewown.mongodb.net/jobApply";

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => app.listen(port))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
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
