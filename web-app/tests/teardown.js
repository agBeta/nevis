import { server } from "../src/server.js";

console.log("Teardown phase...");

server.closeAllConnections();
server.close(() => {
    console.log("server is closed.");
});
