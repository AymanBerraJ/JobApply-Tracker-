const express = require('express');
const app = express();
const path = require('path');
const port = 3000;


app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/createjob', (req, res) => {
    res.render('createjob');
});
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});
app.get('/profile', (req, res) => {
    res.render('profile');
});
app.get('/job', (req, res) => {
    res.render('job');
});


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
