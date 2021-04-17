import http from "http";
import https from "https";
import url from "url";
import fs from "fs";

import { StringDecoder } from "string_decoder";
import { environmentToExport as config } from "./lib/config.js";
import { handlers } from "./lib/handlers.js";
import { helpers } from "./lib/helpers.js";

const httpPORT = config.httpPort;
const httpsPORT = config.httpsPort;

const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

httpServer.listen(httpPORT, () => {
  console.log(`The (http) server is listening on port ${httpPORT} now`);
});

const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

httpsServer.listen(httpsPORT, () => {
  console.log(`The (https) server is listening on port ${httpsPORT} now`);
});

const unifiedServer = (req, res) => {
  const parsedURL = url.parse(req.url, true);

  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  const method = req.method.toLocaleLowerCase();

  const queryStringObject = parsedURL.query;

  const headers = req.headers;

  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    let chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJSONToObject(buffer),
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 200;
      payload = typeof payload === "object" ? payload : {};

      const payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

const router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};
