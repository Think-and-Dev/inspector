const Mongo = require("./Mongo");
const Middleware = require("./middleware/middleware");

/*
console.log("Test mongoDB!!\n");
const testMongo = new Mongo();
testMongo.createConnection();
testMongo.saveAndFlush({test: "description test"}).catch(console.dir);
testMongo.saveAndFlush({test: "description test"}).catch(console.dir);
testMongo.saveAndFlush({test: "description test"}).catch(console.dir);
testMongo.saveAndFlush({test: "description test"}).catch(console.dir);
testMongo.saveAndFlush({test: "description test"}).catch(console.dir);
testMongo.saveAndFlush({test: "description test"}).catch(console.dir);
testMongo.saveAndFlush({test: "description test"}).catch(console.dir);
testMongo.saveAndFlush({test: "description test"}).catch(console.dir);
*/


const middleware = new Middleware();
middleware.getAccountUnderwater();
