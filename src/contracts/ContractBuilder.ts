import { z } from "zod";

class ContractBuilder<
    TBody extends z.ZodTypeAny = z.ZodObject<{}>,
    TQuery extends z.ZodTypeAny = z.ZodObject<{}>,
    TParams extends z.ZodTypeAny = z.ZodObject<{}>
> {
    private readonly _bodySchema: TBody;
    private readonly _querySchema: TQuery;
    private readonly _paramsSchema: TParams;

    constructor(
        bodySchema = z.object({}) as unknown as TBody,
        querySchema = z.object({}) as unknown as TQuery,
        paramsSchema = z.object({}) as unknown as TParams
    ) {
        this._bodySchema = bodySchema;
        this._querySchema = querySchema;
        this._paramsSchema = paramsSchema;
    }

    /**
     * Define the body schema of the contract (used in POST, PUT, PATCH requests)
     * @param schema
     * @example POST /user
     */
    body<T extends z.ZodTypeAny>(schema: T): ContractBuilder<T, TQuery, TParams> {
        return new ContractBuilder(schema, this._querySchema, this._paramsSchema);
    }

    /**
     * Define the query schema of the contract (used in GET requests)
     * @param schema
     * @example GET /user/?name=John&age=30
     */
    query<T extends z.ZodTypeAny>(schema: T): ContractBuilder<TBody, T, TParams> {
        return new ContractBuilder(this._bodySchema, schema, this._paramsSchema);
    }

    /**
     * Define the params schema of the contract (used in routes with parameters, e.g. /user/:id)
     * @param schema
     * @example GET /user/:id
     */
    params<T extends z.ZodTypeAny>(schema: T): ContractBuilder<TBody, TQuery, T> {
        return new ContractBuilder(this._bodySchema, this._querySchema, schema);
    }

    build() {
        return z.object({
            body: this._bodySchema,
            query: this._querySchema,
            params: this._paramsSchema,
        });
    }
}

// Helper pour créer des contrats plus facilement
export const createContract = () => new ContractBuilder();