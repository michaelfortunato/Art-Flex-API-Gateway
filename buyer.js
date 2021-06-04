const User = require("./user");

class Buyer extends User {
  async signup(password) {
    try {
      return await super.signup(password);
    } catch (error) {
      return { status: false, reason: "Internal server error" };
    }
  }
}

module.exports = Buyer;
