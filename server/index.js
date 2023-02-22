if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

//MODULE IMPORTS
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MODELS
const User = require("./models/user");
const Evaluator = require("./models/evaluator");

// MIDDLEWARES
const { isLoggedIn } = require("./middleware");

// ROUTES
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const formRoutes = require("./routes/form");
const evaluatorRoutes = require("./routes/evaluator");
const pdfRoutes = require('./routes/pdf');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;
const dbURL = process.env.DBURL || "mongodb://localhost:27017/nvcti-lab";

mongoose
  .connect(dbURL)
  .then(async () => {
    const exists = await User.findOne({ position: 1 });

    if (!exists) {
      const salt = await bcrypt.genSalt(10);
      const admin = new User({
        email: "admin@nvcti.in",
        isVerified: true,
        position: 1,
        password: await bcrypt.hash('12345678', salt),
      });
      await admin.save();
      
      const adminEvaluator = new Evaluator({
        applicants: [],
        userId: admin._id,
      })
      await adminEvaluator.save();
    }

    console.log("MONGOOSE CONNECTION OPEN");
  })
  .catch((err) => {
    console.log("IN MONGOOSE SOMETHING WENT WRONG", err);
  });

app.use(cors());

// SECURITY
const mongoSanitize = require("express-mongo-sanitize");
app.use(
  mongoSanitize({
    replaceWith: " ",
  })
);

app.use('*', (req, res, next) => {
  console.log(req.baseUrl);
  console.log(req.get('host'));
  next();
});

app.use('/', homeRoutes);
app.use("/auth", authRoutes);
app.use("/form", formRoutes);
app.use('/', pdfRoutes);
app.use("/evaluator", evaluatorRoutes);

app.get("/", (req, res) => {
  res.send({ status: "Helo World" });
});

app.use((err, req, res, next) => {
  const {statusCode = 500, message = "Something went wrong"} = err;
  console.log(message);
  res.status(statusCode).send({msg: message});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
