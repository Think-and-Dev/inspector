const TestMongo = require("./TestMongo");
const Middleware = require("./middleware/middleware");

//console.log("Test mongoDB!!\n");
//const testMongo = new TestMongo();
//testMongo.run().catch(console.dir);

const middleware = new Middleware();
console.log(middleware.getAccountUnderwater());
