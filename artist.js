const User = require("./user");

class Artist extends User {
  constructor(name, email, artworks) {
    super(name, email);
    this.artworks = artworks;
  }
  async signup(password) {
    try {
      return await super.signup(password);
    } catch (error) {
      return { status: false, reason: "Internal server error." };
    }
  }
}

module.exports = Artist;
