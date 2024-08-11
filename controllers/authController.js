const User = require("../models/User");
const Job = require("../models/job");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");

// const ftp = require('ftp')
// const fileUpload = require('express-fileupload')

// config ftp

// const ftpClient = new ftp()

// const ftpConfig = {
//   host: 'ftp.infinityfree.com',  // replace with your FTP host
//   user: 'if0_37071645', // replace with your FTP username
//   password: 'ECiqb8MrdVa' // replace with your FTP password
// };

// // Connect to the FTP server
// function connectFTP() {
//   return new Promise((resolve, reject) => {
//       ftpClient.on('ready', resolve);
//       ftpClient.on('error', reject);
//       ftpClient.connect(ftpConfig);
//   });
// }

// Multer Fichier

const multer = require("multer");
const path = require("path");

// Configuration de multer pour le stockage sur disque + creation de route pour le fichier
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profilePicture") {
      cb(null, "./uploads/profilePictures");
    } else if (file.fieldname === "cvDocuments") {
      cb(null, "./uploads/cvDocuments");
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

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
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "cvDocuments", maxCount: 1 },
  ])(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ errors: err.message });
    }

    const { firstname, lastname, email, password, github } = req.body;

    try {
      const user = await User.create({
        firstname,
        lastname,
        email,
        password,
        github,
        profilePicture: req.files["profilePicture"]
          ? req.files["profilePicture"][0].path
          : null,
        cvDocuments: req.files["cvDocuments"]
          ? req.files["cvDocuments"][0].path
          : null,
      });

      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json({ user: user._id });
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  });
};

// Login
module.exports.login_get = (req, res) => {
  console.log(req.body);

  res.render("login");
};
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  console.log("Email reçu :", email);
  console.log("Mot de passe reçu :", password);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    console.error("Erreur lors de la connexion:", err);
    res.status(500).json({ message: "Erreur serveur" });
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
    const jobs = await Job.find({});
    res.render("dashboard", { jobs });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error");
  }
};

// Createjob
module.exports.createjob_get = (req, res) => {
  res.render("createjob");
};
module.exports.createjob_post = async (req, res) => {
  const {
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
  } = req.body;

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
    res.status(201).json({ job: job._id });
  } catch (error) {
    console.log(error);

    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

// job
module.exports.job_get = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received ID:", id);
    const data = await Job.findById(id);

    console.log("Fetched Data:", data);
    if (!data) {
      return res.status(404).render("job", { message: "Job not found" });
    }
    res.render("job", { data });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: error.message });
  }
};

// job update
module.exports.editjob_get = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      res.render("editjob", { data: job });
    } else {
      res.status(404).send("Job not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};
module.exports.editjob_post = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        jobtitle: req.body.jobtitle,
        jobcompany: req.body.jobcompany,
        website: req.body.website,
        nameemployer: req.body.nameemployer,
        emailcontact: req.body.emailcontact,
        phonenumber: req.body.phonenumber,
        address: req.body.address,
        origin: req.body.origin,
        status: req.body.status,
        comments: req.body.comments,
      },
      { new: true }
    );

    console.log("Job updated successfully");
    res.json({ job });
  } catch (error) {
    console.log("Error updating job:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// update profile
module.exports.updateprofile_get = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Récupérer l'utilisateur par son ID
    
    if (user) {
      res.render("updateprofile", { user: user }); // Passer l'utilisateur à la vue
    } else {
      res.status(404).send("Profile not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

module.exports.updateprofile_post = [
  upload.single('cvDocuments'),  // 'cvDocuments' est le nom du champ de fichier dans le formulaire
  async (req, res) => {
    try {
      // Construire l'objet `updateData` avec les champs qui doivent être mis à jour
      const updateData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        github: req.body.github,
      };

      // Gestion du mot de passe hacher le nouveau mot de passe s'il est fourni
      if (req.body.newPassword) {
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        updateData.password = hashedPassword;
      } else {
        // Si aucun nouveau mot de passe n'est fourni, conserver l'ancien
        updateData.password = req.body.oldPassword;
      }

      // Si un nouveau fichier CV est téléchargé, mettez à jour le champ `cvDocuments` avec le chemin complet
      if (req.file) {
        const filePath = path.join('uploads', 'cvDocuments', req.file.filename);  // Construire le chemin complet du fichier
        updateData.cvDocuments = filePath;
      }

      // Mise à jour du profil de l'utilisateur avec les nouvelles données
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }  // Option pour retourner le document mis à jour
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Profile updated successfully:", user);
      res.json({ user });

    } catch (error) {
      console.log("Error updating Profile:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  }
];


// update fichier
module.exports.download_cv = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user || !user.cvDocuments) {
      return res.status(404).json({ message: "CV non trouvé" });
    }

    const filePath = path.join(__dirname, "..", user.cvDocuments);

    // Vérifier si le fichier existe
    if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (err) {
          console.error("Erreur lors du téléchargement du fichier:", err);
          res.status(500).json({ message: "Erreur serveur" });
        }
      });
    } else {
      res.status(404).json({ message: "Fichier introuvable" });
    }
  } catch (err) {
    console.error("Erreur lors de la récupération du CV:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// delete
// module.exports.deleteJob_delete = async (req, res) => {
//   try {
//     await Job.deleteOne( { _id: req.params.id } )
//     res.redirect('/dashboard')
//   } catch (error) {
//       console.log(error)
//   }
// }

// delete cv update

// module.exports.delete_cv = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user = await User.findById(userId);

//     if (!user || !user.cvDocuments) {
//       return res.status(404).json({ message: "CV non trouvé" });
//     }

//     const filePath = path.join(__dirname, "..", user.cvDocuments);

//     // Supprimer le fichier du serveur
//     fs.unlink(filePath, async (err) => {
//       if (err) {
//         console.error("Erreur lors de la suppression du fichier:", err);
//         return res
//           .status(500)
//           .json({ message: "Erreur lors de la suppression du fichier" });
//       }

//       // Mettre à jour l'utilisateur pour supprimer la référence du CV
//       user.cvDocuments = null;
//       await user.save();

//       res.redirect("/updateprofile");
//     });
//   } catch (err) {
//     console.error("Erreur lors de la suppression du CV:", err);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// };
