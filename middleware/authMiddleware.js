const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, 'bdma secret', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.redirect('/login');
      } else {
        let user = await User.findById(decodedToken.id);
        if (!user) {
          res.redirect('/login');
        } else {
          res.locals.user = user;
          req.user = user;
          next();
        }
      }
    });
  } else {
    res.locals.user = null;
    res.redirect('/login');
  }
};

// check current User

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (token) {
    jwt.verify(token, "bdma secret", async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};
const logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/login');
};

module.exports = { requireAuth, checkUser};
