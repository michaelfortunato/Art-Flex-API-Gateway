const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const AUTH_HOST = process.env.AUTH_APP_SERVICE_SERVICE_HOST || "localhost";
const AUTH_PORT = process.env.AUTH_APP_SERVICE_SERVICE_PORT || 8081;
const accessTokenPublicKeyDirectory = process.env.NODE_ENV !== "dev" ? "/etc/secret-volume/jwts/access-tokens" : process.cwd() + "/secrets";
let accessTokenPublicKeys = [];
fs.readdirSync(accessTokenPublicKeyDirectory).forEach(file => {
    if (file.split(".").pop() === "pub") {
        accessTokenPublicKeys.push(fs.readFileSync(accessTokenPublicKeyDirectory + "/" + file, "utf-8"));
    }
});
const checkCredentials = async (req, res, next) => {
    try {
        const { header } = jwt.decode(req.cookies.accessToken, { complete: true });
        const kid = header.kid;
        const accessTokenPublicKey = accessTokenPublicKeys[kid];
        jwt.verify(req.cookies.accessToken, accessTokenPublicKey)
        next()
    } catch (accessTokenError) {
        try {
            console.log("ok")
            // If the access token was invalid, try to get a new one
            const authRes = await axios.post(
                `http://${AUTH_HOST}:${AUTH_PORT}/generate_token_pair`,
                { refreshToken: req.cookies.refreshToken }
            );
            // If sucessful set the new accessToken cookie 
            res.cookie("accessToken", authRes.data.accessToken, { httpOnly: true, sameSite:'none', secure:'true'})
            res.cookie("refreshToken", authRes.data.refreshToken, { httpOnly: true, sameSite:'none', secure:'true' })
            next()
        } catch (refreshTokenError) {
            console.log(refreshTokenError)
            res.status(401).send({ statusMessage: "Redirect to login." })
        }
    }
}
module.exports = checkCredentials