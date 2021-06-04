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
      const status = authRes.status === 200;
      const statusMessage = authRes.data.statusMessage; 
      return { status: status, statusMessage: statusMessage };
    } catch (error) {
      const status = false;
      const statusMessage =
        error.response.data.statusMessage || "Internal server error";
      return { status: status, statusMessage: statusMessage };
    }
  }
}
module.exports = User;
