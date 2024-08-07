const mongoose = require("mongoose");
const { isEmail } = require("validator");

const jobSchema = new mongoose.Schema({
  jobtitle: {
    type: String,
    required: [true, "Please enter a jobtitle"],
  },
  jobcompany: {
    type: String,
    required: [true, "Please enter a company"],
  },
  website: {
    type: String,
    required: [true, "Please enter a website"],
  },
  nameemployer: {
    type: String,
    required: [true, "Please enter an employers name"],
  },
  emailcontact: {
    type: String,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  phonenumber: {
    type: String,
  },
  address: {
    type: String,
  },
  origin: {
    type: [String],
    required: [true, "Please choose an origin"],
  },
  status: {
    type: [String],
    required: [true, "Please choose an status"],
  },
  comments: {
    type: String,
  }
});

const Job = mongoose.model("job", jobSchema);

module.exports = Job;
