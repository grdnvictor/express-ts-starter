import { NextFunction, Request, Response } from "express";

export const checkAuthentication = (request: Request, response: Response, next: NextFunction) => {
  // TODO: implement auth check
  next();
};
