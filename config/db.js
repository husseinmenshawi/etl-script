let mongoose = require("mongoose");

const mongoDbUrl = process.env.MONGO_DB_URL;

class Database {
  async connect() {
    if (!mongoDbUrl) {
      throw "MONGO_DB_URL environment variable is missing";
    }
    try {
      await mongoose.connect(mongoDbUrl);
      console.log("Database connection successful");
    } catch (error) {
      console.error("Database connection failed");
    }
  }
}

module.exports = new Database();
