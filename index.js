const TestMongo = require("./TestMongo");
const Market = require("./middleware/market");


//console.log("Test mongoDB!!\n");
//const testMongo = new TestMongo();
//testMongo.run().catch(console.dir);

const myMarket = new Market();
console.log(myMarket.borrowAccounts())