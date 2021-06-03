const express = require('express');
const axios = require('axios');

const AUTH_HOST = process.env.AUTH_APP_SERVICE_HOST;
const AUTH_PORT = process.env.AUTH_APP_SERVICE_PORT;

class User {
    constructor ({name}) {

    }
    static async search({name}) {
        // Search user
    }
    static async signup({name, email, password}) {
        try {
            const payload = {
                name: name,
                email: email,
                password: password
            }
            const res = await axios.post(`http://${AUTH_HOST}:${AUTH_PORT}/login`, payload);
            return res
        } catch(error) {
            console.log(error.code);
            const res  = {name: ""}
            return res;
        }
    }
}
module.exports = User