const { MongoClient } = require("mongodb");

class TestMongo {
  constructor() {
    this.uri = "mongodb://127.0.0.1:27017/mongodb";
    this.client = new MongoClient(this.uri, { useUnifiedTopology: true });
    this.databaseName = "rlending";
  }

  async saveAndFlush(persistentObject) {
    try {
      const collection = await this.createConnection();
      await collection.insertOne(persistentObject);

      const query = { address: persistentObject.address };
      const acc = await collection.findOne(query);
      //console.log(acc);
    } finally {
      //console.log("<------->");
    }
  }

  async createConnection() {
    await this.client.connect();
    const database = this.client.db(this.databaseName);
    return database.collection(this.databaseName);
  }

  async closeConnection() {
    await this.client.close();
  }
}
module.exports = TestMongo;
