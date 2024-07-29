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


app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
