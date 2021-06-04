const express = require("express");
const axios = require("axios");

const AUTH_HOST = process.env.AUTH_APP_SERVICE_SERVICE_HOST || "localhost";
const AUTH_PORT = process.env.AUTH_APP_SERVICE_SERVICE_PORT || 8080;

class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  static async search({ name }) {
    // Search user
  }
  async signup(password) {
    try {
      const payload = {
        name: this.name,
        email: this.email,
        password: password,
      };
      const authRes = await axios.post(
        `http://${AUTH_HOST}:${AUTH_PORT}/signup`,
        payload
      );
      const statusMessage = authRes.data.statusMessage;
      return { status: true, statusMessage: statusMessage };
    } catch (error) {
      const statusMessage =
        error.response.data.statusMessage || "Internal server error";
      return { status: false, statusMessage: statusMessage };
    }
  }
  static async signin(email, password) {
    try {
      const payload = {
        email: email,
        password: password,
      };
      const authRes = await axios.post(
        `http://${AUTH_HOST}:${AUTH_PORT}/login`,
        payload
      );
      const { statusMessage, accessToken, refreshToken } = authRes.data;
      // On signin, we could probably get the user by passing the accessToken
      // and calling the account service that I plan to set up.
      // The account service would detect the type via the access token and return
      // either an artist or buyer
      // const user = getUser(accessToken).
      // For now const user = {email: email}
      console.log(authRes.status)
      const user = { email: email };
      return {
        status: authRes.status,
        statusMessage: statusMessage,
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      console.log(error);
      return {
        status: error.response.status || 500,
        statusMessage: error.response.data.statusMessage,
      };
    }
  }
}
module.exports = User;
