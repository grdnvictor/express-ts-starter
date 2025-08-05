import { AnyZodObject, z, ZodError } from "zod";
import { NextFunction, Request, Response } from "express";

export type ValidatedRequest<T extends AnyZodObject> = Request & {
  validated: z.infer<T>;
};

export const validateContract =
  <T extends AnyZodObject>(schema: T) =>
  (request: Request, response: Response, next: NextFunction): void => {
    try {
      // Add a .validated property with the same architecture
      // of a classic request, but ensuring all parameters have
      // been validated
      (request as ValidatedRequest<T>).validated = schema.parse({
        body: request.body,
        query: request.query,
        params: request.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((issue) => {
          // Enlève "body", "query", "params" du début du path -> claude mdr
          const fieldPath =
            issue.path.length > 1
              ? issue.path.slice(1).join(".")
              : issue.path[0];
          errors[fieldPath] = issue.message;
        });

        response.status(422).json({ errors });
        return;
      }
      next(error);
    }
  };
