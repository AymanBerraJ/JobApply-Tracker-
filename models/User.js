const mongoose = require("mongoose");
const { isEmail, isURL } = require("validator");
const bcrypt = require("bcryptjs");
const fs = require ('fs')
const path = require('path')

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

// pre fichier

userSchema.pre('remove', function(next) {
  const user = this;

  // Liste des fichiers à supprimer
  const filesToDelete = [];

  // Vérifie si l'utilisateur a une photo de profil associée
  if (user.profilePicture && user.profilePicture !== 'none') {
    filesToDelete.push(path.join(__dirname, '..', user.profilePicture));
  }

  // Vérifie si l'utilisateur a un CV associé
  if (user.cvDocuments && user.cvDocuments !== 'none') {
    filesToDelete.push(path.join(__dirname, '..', user.cvDocuments));
  }

  // Supprime les fichiers
  filesToDelete.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du fichier :', err);
      } else {
        console.log('Fichier supprimé avec succès :', filePath);
      }
    });
  });

  next(); // Continue la suppression de l'utilisateur
});

// post remove

userSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    // Liste des fichiers à supprimer
    const filesToDelete = [];

    // Vérifie si l'utilisateur avait une photo de profil associée
    if (doc.profilePicture && doc.profilePicture !== 'none') {
      filesToDelete.push(path.join(__dirname, '..', doc.profilePicture));
    }

    // Vérifie si l'utilisateur avait un CV associé
    if (doc.cvDocuments && doc.cvDocuments !== 'none') {
      filesToDelete.push(path.join(__dirname, '..', doc.cvDocuments));
    }

    // Supprime les fichiers
    filesToDelete.forEach((filePath) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression du fichier :', err);
        } else {
          console.log('Fichier supprimé avec succès :', filePath);
        }
      });
    });
  }
});

// login method to login user bcrypt

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
