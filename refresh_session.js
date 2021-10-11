const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const AUTH_HOST = process.env.AUTH_APP_SERVICE_SERVICE_HOST || "localhost";
const AUTH_PORT = process.env.AUTH_APP_SERVICE_SERVICE_PORT || 8081;

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const authRes = await axios.post(`http://${AUTH_HOST}:${AUTH_PORT}/generate_token_pair`, {
      refreshToken: req.cookies.refreshToken,
    });
    const { name, email } = jwt.decode(authRes.data.accessToken);
    res.cookie("accessToken", authRes.data.accessToken, { httpOnly: true });
    res.cookie("refreshToken", authRes.data.refreshToken, { httpOnly: true });
    res.status(200).send({ name, email });
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res
        .status(error.response.status)
        .send({ statusMessage: "Redirect to login" });
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
