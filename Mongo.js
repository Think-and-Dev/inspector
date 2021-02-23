const { MongoClient } = require("mongodb");
const log4js = require("log4js");

class Mongo {
  constructor() {
    this.uri = "mongodb://127.0.0.1:27017/mongodb";
    this.client = new MongoClient(this.uri, { useUnifiedTopology: true });
    this.databaseName = "rlending";
    this.logger = log4js.getLogger();
    this.logger.level = "info";
  }

  async saveAndFlush(persistentObject) {
    try {
      const collection = await this.getConnection();
      await collection.insertOne(persistentObject);

      /*
      const query = { address: persistentObject.address };
      const acc = await collection.findOne(query);
      console.log(acc);
      */
    } catch (err) {
      this.logger.error(
        "Error inserting:",
        persistentObject.address,
        "Error description:",
        err
      );
    }
  }

  async createConnection() {
    try {
      await this.client.connect();
      this.logger.info("Created connection to DB!")
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
