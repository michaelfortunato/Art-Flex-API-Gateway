const express = require("express");
const axios = require("axios");
const router = express.Router();

const AUTH_HOST = process.env.AUTH_APP_SERVICE_SERVICE_HOST || "localhost";
const AUTH_PORT = process.env.AUTH_APP_SERVICE_SERVICE_PORT || 8081;
router.post("/", async (req, res) => {
    try {
        const authRes = await axios.post(
            `http://${AUTH_HOST}:${AUTH_PORT}/login`,
            {
                email: req.body.email.toLowerCase(),
                password: req.body.password
            }
        )
        const { name, email, accessToken, refreshToken } = authRes.data;
        res.cookie("accessToken", accessToken, { httpOnly: true })
        res.cookie("refreshToken", refreshToken, { httpOnly: true })
        res.status(200).send({ name: name, email: email });
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