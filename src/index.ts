import express, { Express } from "express";
import dotenv from "dotenv";

import RouteLoader from "./RouteLoader.ts";

dotenv.config();

const app: Express = express();
app.use(express.json());
const INTERNAL_PORT = process.env.INTERNAL_SERVICE_PORT;
const EXPOSED_PORT = process.env.SERVICE_PORT;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET MUST BE DEFINED IN YOUR .ENV FILE");
}

const routes = await RouteLoader();
app.use("/", routes);

app.use((_request, response) => {
  response.status(404).send();
});

app.listen(INTERNAL_PORT, () => {
  console.log(
    `[MY-SERVICE]: MY-SERVICE is running at http://localhost:${EXPOSED_PORT}`,
  );
});
