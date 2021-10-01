const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const emailHtml = require("./email_template.js");
const router = express.Router();
const AUTH_HOST = process.env.AUTH_APP_SERVICE_SERVICE_HOST || "localhost";
const AUTH_PORT = process.env.AUTH_APP_SERVICE_SERVICE_PORT || 8081;

if (process.env.NODE_ENV !== "dev") {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: "automated-services@art-flex.co",
      privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
      serviceClient: process.env.CLIENT_ID
    },
  });
}
const sendVerificationEmail = async (toEmail, verificationToken) => {
  await transporter.verify();
  await transporter.sendMail({
    from: "no-reply@art-flex.co <no-reply@art-flex.co>",
    to: toEmail,
    subject: "[Art Flex] Please verify your account",
    html: emailHtml(toEmail, verificationToken)
  });
};

router.post("/new", async (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
  try {
    const authRes = await axios.post(
      `http://${AUTH_HOST}:${AUTH_PORT}/signup/new`,
      payload
    );
    res.status(200).send({ email: req.body.email });
    if (process.env.NODE_ENV !== "dev") {
      try {
        await sendVerificationEmail(
          req.body.email,
          authRes.data.verificationToken
        );
      } catch (error) {
        console.log("email error!!!!!")
        console.log(error);
      }
    } else {
      // console log the verifcation token for testing
      console.log(authRes);
    }
  } catch (error) {
    console.log(error)
    res.status(error.response.status).send(error.response.data);
  }
});
router.post("/verify/:email/:token", async (req, res) => {
  try {
    const payload = {
      email: req.params.email,
      token: req.params.token
    };
    const authRes = await axios.post(
      `http://${AUTH_HOST}:${AUTH_PORT}/signup/verify`,
      payload
    );
    res.send(authRes.data);
  } catch (error) {
    res.status(error.response.status).send(error.response.data);
  }
});

module.exports = router;
