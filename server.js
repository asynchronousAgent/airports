const http = require("http");
const app = require("./app");

const server = http.createServer(app);
const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server up and running on port ${port}`));
