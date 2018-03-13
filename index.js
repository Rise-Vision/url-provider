const logger = require("./src/logger");
const app = require("./src/app");

process.on("SIGUSR2", logger.debugToggle);
Error.stackTraceLimit = 50;

app.start();
