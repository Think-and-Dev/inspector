const { MongoClient } = require("mongodb");
const { MONGO_URI, MONGO_DB_NAME } = require("./config/constants");
const log4js = require("log4js");

class Mongo {
  constructor() {
    this.uri = MONGO_URI;
    this.client = new MongoClient(this.uri, { useUnifiedTopology: true });
    this.databaseName = MONGO_DB_NAME;
    this.logger = log4js.getLogger();
    this.logger.level = "info";
  }

  async saveAndFlush(persistentObject) {
    try {
      const collection = await this.getConnection();
      await collection.insertOne(persistentObject);
    } catch (err) {
      this.logger.error(
        "Error inserting:",
        persistentObject.address,
        "Error description:",
        err
      );
    }
  }

  async getAll() {
    try {
      const collection = await this.getConnection();
      const searchCursor = await collection.find({ shortfall: { $ne: 0 } });

      let accounts = [];

      while (await searchCursor.hasNext()) {
        accounts.push(await searchCursor.next());
      }
      return accounts;
    } catch (err) {
      this.logger.error(
        "Error obtaining collection:",
        this.databaseName,
        "Error description:",
        err
      );
    }
  }

  async createConnection() {
    try {
      await this.client.connect();
      this.logger.info("Created connection to DB!");
    } catch (err) {
      this.logger.error(err);
    }
  }

  async getConnection() {
    const database = this.client.db(this.databaseName);
    return database.collection(this.databaseName);
  }

  async closeConnection() {
    try {
      await this.client.close();
    } catch (err) {
      this.logger.error(err);
    }
  }
}
module.exports = Mongo;
