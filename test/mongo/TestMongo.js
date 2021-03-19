const { MongoClient } = require("mongodb");
class TestMongo{
  constructor(){
    this.uri="mongodb://127.0.0.1:27017/mongodb"
    this.client= new MongoClient(this.uri)
  }


  //validate mongodb, write and read
  async run() {
    try {
      //connect to client
      await this.client.connect();
      //set db
      const database = this.client.db('test');
      //set collection
      const collection = database.collection('test');
      //wait for insert in mongo
      await collection.insertOne({
        item: "canvas",
        qty: 100,
        tags: ["cotton"],
        size: { h: 28, w: 35.5, uom: "cm" }
      })
      // query for item 
      const query = { item: 'canvas' };
      //wait for response 
      const movie = await collection.findOne(query);
      console.log(movie);
    } finally {
      // ensures that the client will close when you finish/error
      await this.client.close();
    }
  }

}
console.log('Test mongoDB!!\n')
const testMongo = new TestMongo()
testMongo.run().catch(console.dir);
// module.exports = TestMongo;