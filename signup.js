const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");

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
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    serviceClient: "111814358956763483029"
  },
});
const sendVerificationEmail = async (toEmail, verificationToken) => {
  if ("111814358956763483029" === process.env.CLIENT_ID) {
    console.log("clientes are equal") 
  } else {
  console.log("clients are not equal")  
  }
  if ('-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9Ij2PULQsNFBL\nWF67uIJZC7hOw5equrUHbAmVg8OUBtTh9ETl1oQWyG0oSQPwgw1vqFh9ykWiUczm\n8vmw6jzY6pLeFaM76avwqQa0bec/pP+e+3CveluH16MMpMNcianhY1NjX1Ei6Uv3\nPf7WxGKx7M/z6XQ+YeeX8s+ydMxvwubyXjUz4lljDpT50r8C8+z5zDmGkUKzdO4o\nTbimNOcpTP+wBfF8eFEo0nY/nD5lPdBd4vTo2lMUf7xtd8iXEqsxxDEOgRDiGAo7\n1yxolFGVo09RTYEP1G+0qrTCSovuqvOE3gkZ+18F0d4QKe53Y2wHUURWL1ynMzJ6\nkf//Yr73AgMBAAECggEAImJXs7bV0pV+JXx+2HzeQacGTldzusevwpYrFeH7C+3E\nBQIeBnTd1bCBW8oOa8q/hhWiZNgBmdVqPXBd4YJsJnla0wI3B1zfc+Sewe2bFXB/\nQl1u6pABlOwoidNoauniFwYyMkYxX3nvZBcCvfO9B6DIW40NI4w0COVNSiG+yvBg\nqSo+iJkSaRr0AP0eJcO19/SdjBtP+7P5xYgWPXZmy5fCXCYAUggpejckIdPV17Ll\naMbCM8hAGIXiR1nMRcaPHOhNwSHBV3HQB5tZLrSfKT92FYcKia4GA9H0UIRwyKX1\nC1uhpLTFvI8B8KGGa/i5Bhy0fkQWNr4Dxohi860e9QKBgQD+PGkIzlZW49AjsBcF\nq//oVgSX8+tgMK8g/4p53plATC5ixZd7zIveVvUH4j3bXebjsDh+rZeLo36EESJB\nxbBOsI2OctDmVSyYAWrrnIERejL7RGxvuBAPSlhMozqU9f8S0hcqdEeh15ElOq5r\nf0LBXU8nSKT8Z9S+tSasWUfpOwKBgQC+cjEKhBZs1F2FMkn7kDeyApj76yHRCsLY\n+gLh1tE+gRpREhZw9aA/KIclGMCj/fziIrWlXy/qptxljWWNh+S+TQkR2wIossaF\nt9d8UvtfAekIK9aiephjxUOLxJaaWivuw+MSFBnlvWwf5rygBNruvJQOyVoFbZeS\n0Wp6dnUFdQKBgCBZaXgAYUYPGMXhuxwypY5Xm6AGHnYP28jUGzekllVzHBffUoYj\nIcz5vZXyOLK4ARAJtTaROg4/kHKXh4dc8zEgD/MHMwOL5O+2hndSY63ooaINM8sH\nXavEZvXhcyvPHVS0vNPfFdpHBqX5EIaHG+RkzhSOjse7Invdqv0VIyxPAoGBAJCA\n1sMy7E0RahCJ0ucFS61PGUN06wjRkHzQXuV7ePNjRFOlVM/LIBcsKjc0q98C9iGj\n0o4zRolWqL6JZjfYl/DpROt+cQnudIG7t86GrGMvcOEZWleYjA6P/CuOM/PUXadi\njOYHyIqwit0913vXk0M4ZWM+1oZt3GezbIaVYT+NAoGABFttGIuT5rx46M+/HPhI\ngqR2yAN5DffP3BqtfjPRxVLMsa01NMklzANiZRr3hbFheciOqH0dgVMOBhG9B5i4\ns7T0mSlFnQbW70Tgl3wfP/KcziJZmRTxIbqRVxSewdmiAO0EQQa7NQuK+GvpydCt\n0oEsj6XW+nj2AM7cWxV8VnE=\n-----END PRIVATE KEY-----\n' === env.process.PRIVATE_KEY) {
    console.log("ok!!")
    console.log(process.env.PRIVATE_KEY)
    console.log(process.env.PRIVATE_KEY.replace(/\\n/g,'\n'))
  } else {
    console.log("clients are not equal") 
  }

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
    try {
      await sendVerificationEmail(
        req.body.email,
        authRes.data.verificationToken
      );
    } catch (error) {
      console.log("email error!!!!!")
      console.log(error);
    }
  } catch (error) {
    console.log(error)
    res.status(error.response.status).send(error.response.data);
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
