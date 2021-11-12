import type { Jwt } from "jsonwebtoken";

const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const router = express.Router();
const isLoggedIn = async (accessToken: Jwt, refreshToken: Jwt) => {
	try {
		const { header } = jwt.decode(accessToken, { complete: true });
		const {kid} = header;
		const accessTokenPublicKey = accessTokenPublicKeys[kid];
		jwt.verify(accessToken, accessTokenPublicKey);
		return { accessToken, refreshToken };
	} catch (accessTokenError) {
		try {
			const { data } = await axios.post(
				`http://${AUTH_HOST}:${AUTH_PORT}/generate_token_pair`,
				{ refreshToken: refreshToken }
			);
			return { accessToken: data.accessToken, refreshToken: data.refreshToken };
		} catch (refreshTokenError) {
			return null;
		}
	}
};

router.get("/", isLoggedIn);

export default router;
