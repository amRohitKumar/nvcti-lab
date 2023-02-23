const express = require("express");
const axios = require("axios");
const router = express.Router();

const { isLoggedIn, isAdmin } = require("../middleware");
const catchAsync = require("../utilities/catchAsync");
const Form = require("../models/form");
const Evaluator = require("../models/evaluator");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const { sendMail } = require("../utilities/mailsender");


const passGenerator = require("../utilities/generateUID");

router.route("/createevaluator").get(
  catchAsync(async (req, res) => {
    const evalList = new Evaluator({
      userId: mongoose.Types.ObjectId("63693aa240a9c863ed92ea66"),
      applicants: [],
    });
    await evalList.save();
  })
);

router.route("/applicants").get(
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const mentorID = req.user._id;
    const mentor = await Evaluator.findOne({ userId: mentorID }).populate(
      "applicants"
    );
    console.log(mentor);
    res.status(200).json({ applications: mentor.applicants || [] });
  })
);

// to accept a user application
router.route("/update").post(
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const applicant = await Form.findById(req.body.applicantId);
    const status =  req.body.status;
    const user = await User.findById(applicant.userId);
    applicant.status = status;
    await applicant.save();

    if (user.notifications.length == 10) {
      user.notifications.pop();
    }
  
    if (status.toLowerCase() == "accepted") {
      user.notifications.unshift(`Your application for ${applicant.projectTitle} has been accepted`);
    } else if (status.toLowerCase() == "rejected") {
      user.notifications.unshift(`Your application for ${applicant.projectTitle} has been rejected`);
    }
    user.isNewNotification = true;
    await user.save();
    return res.status(200).send({ msg: "Status updated successfully" });
  })
);

router.route("/forward").post(
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const { applicants, mails } = req.body;
    console.log("out", applicants, mails);
    const applicantIds = applicants.map((id) => mongoose.Types.ObjectId(id));

    for (var mail of mails) {
      const password = passGenerator(16);
      const name = Date.now();
      console.log(password, name);
      const resp = await axios.post(
        "http://localhost:8080/auth/registermentor",
        { email: mail, password }
      );
      const evaluator = resp.data.mentor;
      const evaluatorId = evaluator._id;
      console.log(name, password);

      // check if evaluator already exists
      const alreadyExistEvaluator = await Evaluator.findOne({
        userId: evaluatorId,
      });

      var textmsg = "";

      if (alreadyExistEvaluator) {
        applicantIds.forEach((id) => alreadyExistEvaluator.applicants.push(id));
        textmsg = "please login to the portal to check new applicants. Use the same credentials as before";
        await alreadyExistEvaluator.save();
      } else {
        // else create a new evaluator
        const evalList = await Evaluator.create({
          userId: mongoose.Types.ObjectId(evaluatorId),
          applicants: applicantIds,
        });
        textmsg = `please login to the portal to check new applicants. Use the following credentials \nemail: ${mail} \npassword: ${password}`;
      }
      await sendMail({
        to_email: mail,
        subject_email: "Forwarded applications from admin",
        text_email: textmsg,
        html_email: null,
      });
    }
    res.status(200).send({ msg: "Forwarded successfully" });
  })
);

router.route("/forwardsuperadmin").post(
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const { applicants } = req.body;
    const applicantIds = applicants.map((id) => mongoose.Types.ObjectId(id));

    for (var applicantId of applicantIds) {
      var form = await Form.findById(applicantId);
      var forwardedBy = form.forwardedBy || [];
      forwardedBy.push(req.user.email);
      form.forwardedBy = Array.from(new Set(forwardedBy));
      form.reEvaluation = false;
      await form.save();
    }

    const adminId = await User.findOne({ position: 3 });

    const superAdmin = await Evaluator.findOne({
      userId: adminId,
    });
    applicantIds.forEach((id) => superAdmin.applicants.push(id));
    await superAdmin.save();
    res.status(200).send({ msg: "Forwarded successfully !" });
  })
);

router.route("/addcomment").post(
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    const form = await Form.findById(req.body.formId);
    var ind = 0;
    for (mentor of form.mentorVerdict) {
      if (mentor.id == req.user._id) {
        form.mentorVerdict.splice(ind, 1);
        break;
      }
      ind += 1;
    }

    var mentorResp = {
      id: req.user._id,
      comments: null,
      result: null
    }

    mentorResp.comments = req.body.comment.comment;
    mentorResp.result = req.body.comment.verdict;

    form.mentorVerdict.push(mentorResp);

    await form.save()
    res.status(200).send({ msg: "Comment added successfully!" });
  })
)

router.route("/revert").post(
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    // console.log(req.body.)
    const form = await Form.findById(req.body.applicantId);
    // console.log('rr',form);
    form.reEvaluation = true;
    await form.save();
    var textmsg = "Some applications need to be re-evaluated please login to view them";
    for (var mail of form.forwardedBy) {
      await sendMail({
        to_email: mail,
        subject_email: "rechecking some applications",
        text_email: textmsg,
        html_email: null,
      });
    }
    res.status(200).send({ msg: "The form has been reverted to the mentors" });
  })
)

module.exports = router;
