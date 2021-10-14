const express = require("express");
const router = express.Router();
const axios = require("axios");
const ACCOUNT_HOST =
  process.env.ACCOUNT_APP_SERVICE_SERVICE_HOST || "localhost";
const ACCOUNT_PORT = process.env.ACCOUNT_APP_SERVICE_SERVICE_PORT || 8082;

router.get("/", async (req, res) => {
  res.send("Good");
});

router.post("/studio/upload", async (req, res) => {
  try {
    const accountRes = await axios.get(
      `http://${ACCOUNT_HOST}:${ACCOUNT_PORT}/studio/upload`, {
        ...req.body
      }
    );
    res.status(200).send(accountRes.data)
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

router.post("/studio/sell_item", async (req, res) => {});

module.exports = router;
