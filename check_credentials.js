const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const AUTH_HOST = process.env.AUTH_APP_SERVICE_SERVICE_HOST || "localhost";
const AUTH_PORT = process.env.AUTH_APP_SERVICE_SERVICE_PORT || 8081;
const accessTokenPublicKeyDirectory =
  process.env.NODE_ENV !== "dev"
    ? "/etc/secret-volume/jwts/access-tokens"
    : process.cwd() + "/secrets";
let accessTokenPublicKeys = [];
fs.readdirSync(accessTokenPublicKeyDirectory).forEach((file) => {
  if (file.split(".").pop() === "pub") {
    accessTokenPublicKeys.push(
      fs.readFileSync(accessTokenPublicKeyDirectory + "/" + file, "utf-8")
    );
  }
});
const checkCredentials = async (req, res, next) => {
  try {
    const { header } = jwt.decode(req.cookies.accessToken, { complete: true });
    const kid = header.kid;
    const accessTokenPublicKey = accessTokenPublicKeys[kid];
    jwt.verify(req.cookies.accessToken, accessTokenPublicKey);
    next();
  } catch (accessTokenError) {
    try {
      // If the access token was invalid, try to get a new one
      const authRes = await axios.post(
        `http://${AUTH_HOST}:${AUTH_PORT}/generate_token_pair`,
        { refreshToken: req.cookies.refreshToken }
      );
      // If sucessful set the new accessToken cookie
      res.cookie("accessToken", authRes.data.accessToken, { httpOnly: true });
      res.cookie("refreshToken", authRes.data.refreshToken, { httpOnly: true });
      // Also set the local store as logout will need the refreshToken
      res.locals.refreshToken = authRes.data.refreshToken
      next();
    } catch (refreshTokenError) {
      // Clear stale access and refresh token cookies.
      // Options must be identical to the ones the cookies were intialized with
      res.clearCookie("accessToken", { httpOnly: true });
      res.clearCookie("refreshToken", { httpOnly: true });
      res.status(401).send({ statusMessage: "Redirect to login." });
    }
  }
};
module.exports = checkCredentials;
// ***********
// Summary: 1) Should I verify refreshTokens at the API gateway? 
// 2) Should I generate a new refreshToken for each accessToken verification
// Should I generate a new refreshToken for each accessToken verificaiton?
// This seems to defeat the point of taking load off the auth service.
// It only comes up because I need to verify the integrity of the refreshToken before
// Destroying it as explained in af-auth-app/logout.js
// I do not feel like I should be validating refreshTokens 
// (ie have there public keys at the api gateway but maybe i should)
// ***********