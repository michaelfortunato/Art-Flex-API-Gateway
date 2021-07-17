const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const json = require("./secret.json");

const router = express.Router();
const AUTH_HOST = process.env.AUTH_APP_SERVICE_SERVICE_HOST || "localhost";
const AUTH_PORT = process.env.AUTH_APP_SERVICE_SERVICE_PORT || 8080;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: "automated-services@art-flex.co",
    serviceClient: json.client_id,
    privateKey: json.private_key,
  },
});
const sendVerificationEmail = async (toEmail, verificationToken) => {
  await transporter.verify();
  await transporter.sendMail({
    from: "no-reply@art-flex.co <no-reply@art-flex.co>",
    to: toEmail,
    subject: "[Art Flex] Please verify your account",
    text:
      "Click the link to confirm your account " +
      "https://art-flex.co/signup/verify/" +
      verificationToken,
  });
};

router.post("/new", async (req, res) => {
  try {
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
    } catch (error) {
      res.status(error.response.status).send(error.response.data);
    }
    // Otherwise, we send the email
    res.send(authRes.data);
    await sendVerificationEmail(req.body.email, authRes.data.verificationToken);
  } catch (error) {
    res.sendStatus(500);
  }
});
router.post("/verify/:email/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const payload = {
      email: req.params.email,
    };
    const authRes = await axios.post(
      `http://${AUTH_HOST}:${AUTH_PORT}/signup/verify/${token}`,
      payload
    );
    res.send(authRes.data);
  } catch (error) {
    res.status(error.response.status).send(error.response.data);
  }
});

module.exports = router;