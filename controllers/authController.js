const User = require("../models/User");
const Job = require("../models/job");
const jwt = require("jsonwebtoken");

//handle errors

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "that email is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "that password is not correct";
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// COOKIE

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "bdma secret", {
    expiresIn: maxAge,
  });
};

// Register
module.exports.register_get = (req, res) => {
  res.render("register");
};

module.exports.register_post = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    github,
    profilePicture,
    cvDocuments,
  } = req.body;

  try {
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      github,
      profilePicture,
      cvDocuments,
    });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

// Login
module.exports.login_get = (req, res) => {
  console.log(req.body);

  res.render("login");
};
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

// Logout
module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/login");
};

// Dashboard

module.exports.dashboard_get = async (req, res) => {
  try {
    const jobs = await Job.find({})
    res.render('dashboard', { jobs }) 
  } catch (error) {
    console.log(error)
    res.status(500).send("An error") 
  }

};

// Createjob

module.exports.createjob_get = (req, res) => {
  res.render("createjob");
};
module.exports.createjob_post = async (req, res) => {
  const { jobtitle, jobcompany, website, nameemployer, emailcontact, phonenumber, address, origin, status, comments } = req.body;

  
  try {
    
    const job = await Job.create({
      jobtitle,
      jobcompany,
      website,
      nameemployer,
      emailcontact,
      phonenumber,
      address,
      origin,
      status,
      comments,
    });
    res.status(201).json({ job: job._id })
  }catch(error){
    console.log(error)

    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
};

// job

module.exports.job_get = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received ID:', id);
    const data = await Job.findById(id);

    console.log('Fetched Data:', data);
    if (!data) {
      return res.status(404).render('job', { message: "Job not found" }); // Utilisez une vue d'erreur
    }
    res.render('job', { data });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: error.message });
  }
};

