
const TestMongo = require('./TestMongo');


console.log('Test mongoDB!!\n')
const testMongo = new TestMongo()
testMongo.run().catch(console.dir);