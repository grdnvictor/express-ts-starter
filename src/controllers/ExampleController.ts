import {
    Request,
    Response
} from "express";
import { ValidatedRequest } from "@/middlewares";
import { ContractsExample } from "@/contracts";

export class ExampleController {
    static mymethod(request: Request, response: Response) {
        const validatedRequest = request as ValidatedRequest<typeof ContractsExample>;

        const {
            name,
            description,
            phone
        } = validatedRequest.validated.query;

        response.status(200).json({
            message: "Hello, world!",
            vars: {
                name,
                description,
                phone
            }
        })
    }
}