import { Router } from "express";
import glob from "fast-glob";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.join(__dirname, "..");

// see: https://dev.to/dhinesh03/organizing-express-routes-with-a-route-loader-l73
// Modified in order to make it work with TypeScript (magical ???? -> need to dig how it works)
export default async function RouteLoader(
  globPattern: string = "src/routes/*.ts",
): Promise<Router> {
  let router = Router();
  let files: string[] = [];
  try {
    files = await glob(globPattern, { cwd: BASE_DIR });
  } catch (error) {
    console.error(error);
  }

  for (const file of files) {
    if (
      fs.statSync(file).isFile() &&
      path.extname(file).toLowerCase() === ".ts"
    ) {
      try {
        const routeModule = await import(path.resolve(file));
        router = (routeModule.default || routeModule)(router);
      } catch (e: any) {
        throw new Error(
          `Error when loading route file: ${file} [ ${e.toString()} ]`,
        );
      }
    }
  }

  return router;
}
