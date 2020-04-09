import * as sourceMapSupport from "source-map-support";
sourceMapSupport.install();

import * as path from "path";
import * as http from "http";

import * as express from "express";
import * as morgan from "morgan";

////////////////////////////////////////////////////////////////////////////////
// CONFIGURATION

const port: number = parseInt(process.env["VOYAGER_SERVER_PORT"]) || 8000;
const devMode: boolean = process.env["NODE_ENV"] !== "production";

const rootDir = path.resolve(__dirname, "../../..");
const staticDir = path.resolve(rootDir, "bin/");

////////////////////////////////////////////////////////////////////////////////

const app = express();
app.disable('x-powered-by');

// logging
if (devMode) {
    app.use(morgan("tiny"));
}

// static file server
app.use("/", express.static(staticDir));

////////////////////////////////////////////////////////////////////////////////

const server = new http.Server(app);
server.listen(port, () => {
    console.info(`Server ready and listening on port ${port}\n`);
});
