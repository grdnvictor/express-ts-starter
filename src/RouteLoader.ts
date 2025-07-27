import { Router } from "express";
import glob from "fast-glob";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// see: https://dev.to/dhinesh03/organizing-express-routes-with-a-route-loader-l73
// Modified in order to make it work with TypeScript (magical ???? -> need to dig how it works)
export default async function RouteLoader(
    globPattern?: string,
): Promise<Router> {
  let router = Router();
  let files: string[] = [];

  // Déterminer le pattern en fonction de l'environnement
  const isDevelopment = process.env.NODE_ENV === 'development';
  const defaultPattern = isDevelopment
      ? "src/routes/*.ts"  // En dev, chercher les .ts dans src/
      : "dist/routes/*.js"; // En prod, chercher les .js dans dist/

  const pattern = globPattern || defaultPattern;
  const expectedExtension = isDevelopment ? ".ts" : ".js";

  try {
    files = await glob(pattern, { cwd: process.cwd() });
  } catch (error) {
    console.error(error);
  }

  for (const file of files) {
    if (
        fs.statSync(file).isFile() &&
        path.extname(file).toLowerCase() === expectedExtension
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