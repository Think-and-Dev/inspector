const Mongo = require("./Mongo");
const Middleware = require("./middleware/middleware");

const middleware = new Middleware();
middleware.getAccountUnderwater();
