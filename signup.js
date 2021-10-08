const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const emailHtml = require("./email_template.js");
const router = express.Router();
const AUTH_HOST = process.env.AUTH_APP_SERVICE_SERVICE_HOST || "localhost";
const AUTH_PORT = process.env.AUTH_APP_SERVICE_SERVICE_PORT || 8081;
let transporter = null;

if (process.env.NODE_ENV !== "dev") {
  transporter = nodemailer.createTransport({
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
    email: req.body.email.toLowerCase(),
    password: req.body.password,
  };
  try {
    const authRes = await axios.post(
      `http://${AUTH_HOST}:${AUTH_PORT}/signup/new`,
      payload
    );
    console.log(authRes)
    res.status(200).send({
      name: req.body.name,
      email: req.body.email
    });
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
      console.log(authRes.data);
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      res.status(500).send({ statusMessage: "Internal server error" });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).send({ statusMessage: "Internal server error" });
    }
  }
});
router.post("/verify", async (req, res) => {
  try {
    const authRes = await axios.post(
      `http://${AUTH_HOST}:${AUTH_PORT}/signup/verify`,
      {
        email: req.body.email.toLowerCase(),
        token: req.body.token
      }
    );
    const { refreshToken, name, email, statusMessage } = authRes.data;
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite:'none', secure:'true'})
    res.send({
      name,
      email,
      statusMessage
    });
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      res.status(500).send({ statusMessage: "Internal server error" });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).send({ statusMessage: "Internal server error" });
    }
  }
});

module.exports = router;
