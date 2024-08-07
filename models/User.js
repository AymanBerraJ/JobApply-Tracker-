const mongoose = require("mongoose");
const { isEmail, isURL } = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please enter an Firstname"],
  },
  lastname: {
    type: String,
    required: [true, "Please enter an Lastname"],
  },
  email: {
    type: String,
    required: [true, "Please enter an Email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valide Email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a Password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  github: {
    type: String,
    validate: [isURL, "Please enter a valid URL"],
  },
  profilePicture: { type: String, default: "none" },
  cvDocuments: { type: String, default: "none" }
});

// save and create the user

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// login method to login user

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const User = mongoose.model("user", userSchema);

module.exports = User;
