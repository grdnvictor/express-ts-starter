import { z } from "zod";

// Utils types for Zod schemas
type AnyZodObject = z.ZodObject<any>;
type EmptyZodObject = z.ZodObject<{}>;

// Empty schema for default values
const EMPTY_SCHEMA = z.object({}) as EmptyZodObject;

/**
 * Immutable builder for creating HTTP validation contracts
 *
 * @description
 * Uses the fluent interface pattern to create type-safe validation schemas
 * for HTTP requests. Each method returns a new instance, ensuring immutability.
 *
 * @example Basic usage
 * ```typescript
 * const contract = createContract()
 *   .body(z.object({ name: z.string() }))
 *   .query(z.object({ page: z.number() }))
 *   .params(z.object({ id: z.string() }))
 *   .build();
 * ```
 *
 * @example With middleware integration
 * ```typescript
 * app.post('/api/users/:id',
 *   validate(userContract.build()),
 *   async (req, res) => {
 *     // req.body, req.query, req.params are now type-safe
 *   }
 * );
 * ```
 */
export class ContractBuilder<
    TBody extends AnyZodObject = EmptyZodObject,
    TQuery extends AnyZodObject = EmptyZodObject,
    TParams extends AnyZodObject = EmptyZodObject
> {
    private readonly schemas: Readonly<{
        body: TBody;
        query: TQuery;
        params: TParams;
    }>;

    constructor(
        body: TBody = EMPTY_SCHEMA as TBody,
        query: TQuery = EMPTY_SCHEMA as TQuery,
        params: TParams = EMPTY_SCHEMA as TParams
    ) {
        this.schemas = Object.freeze({ body, query, params });
    }

    /**
     * Define the request body schema
     *
     * @description
     * Sets the validation schema for the request body.
     * Typically used for POST, PUT, and PATCH requests where data is sent in the body.
     *
     * @param schema - Zod object schema for body validation
     * @returns New ContractBuilder instance with updated body schema
     *
     * @example POST request - Create user
     * ```typescript
     * // Route: POST /api/users
     * .body(z.object({
     *   email: z.string().email(),
     *   password: z.string().min(8),
     *   name: z.string().optional()
     * }))
     * ```
     *
     * @example PUT request - Update user
     * ```typescript
     * // Route: PUT /api/users/:id
     * .body(z.object({
     *   email: z.string().email().optional(),
     *   name: z.string().optional(),
     *   bio: z.string().max(500).optional()
     * }))
     * ```
     *
     * @example PATCH request - Partial update
     * ```typescript
     * // Route: PATCH /api/posts/:id
     * .body(z.object({
     *   title: z.string(),
     *   content: z.string(),
     *   published: z.boolean()
     * }).partial())
     * ```
     */
    body<T extends AnyZodObject>(schema: T): ContractBuilder<T, TQuery, TParams> {
        return new ContractBuilder(schema, this.schemas.query, this.schemas.params);
    }

    /**
     * Define the query parameters schema
     *
     * @description
     * Sets the validation schema for URL query parameters.
     * Used for GET requests and any request with query strings.
     * Note: Query parameters are always strings in raw form,
     * use coercion for numbers/booleans.
     *
     * @param schema - Zod object schema for query validation
     * @returns New ContractBuilder instance with updated query schema
     *
     * @example Pagination parameters
     * ```typescript
     * // Route: GET /api/users?page=1&limit=10
     * .query(z.object({
     *   page: z.coerce.number().min(1).default(1),
     *   limit: z.coerce.number().min(1).max(100).default(10)
     * }))
     * ```
     *
     * @example Search with filters
     * ```typescript
     * // Route: GET /api/products?search=laptop&minPrice=500&maxPrice=2000
     * .query(z.object({
     *   search: z.string().optional(),
     *   minPrice: z.coerce.number().optional(),
     *   maxPrice: z.coerce.number().optional(),
     *   category: z.enum(['electronics', 'clothing', 'books']).optional()
     * }))
     * ```
     *
     * @example Boolean flags
     * ```typescript
     * // Route: GET /api/posts?published=true&featured=false
     * .query(z.object({
     *   published: z.coerce.boolean().optional(),
     *   featured: z.coerce.boolean().optional(),
     *   sortBy: z.enum(['date', 'popularity', 'title']).default('date')
     * }))
     * ```
     */
    query<T extends AnyZodObject>(schema: T): ContractBuilder<TBody, T, TParams> {
        return new ContractBuilder(this.schemas.body, schema, this.schemas.params);
    }

    /**
     * Define the route parameters schema
     *
     * @description
     * Sets the validation schema for dynamic route parameters (path variables).
     * Used for routes with placeholders like :id, :userId, etc.
     * Route params are extracted from the URL path.
     *
     * @param schema - Zod object schema for route params validation
     * @returns New ContractBuilder instance with updated params schema
     *
     * @example Single parameter
     * ```typescript
     * // Route: GET /api/users/:id
     * .params(z.object({
     *   id: z.string().uuid()
     * }))
     * ```
     *
     * @example Multiple parameters
     * ```typescript
     * // Route: GET /api/teams/:teamId/members/:memberId
     * .params(z.object({
     *   teamId: z.string().uuid(),
     *   memberId: z.string().uuid()
     * }))
     * ```
     *
     * @example Nested resources with validation
     * ```typescript
     * // Route: DELETE /api/posts/:postId/comments/:commentId
     * .params(z.object({
     *   postId: z.coerce.number().positive(),
     *   commentId: z.coerce.number().positive()
     * }))
     * ```
     */
    params<T extends AnyZodObject>(schema: T): ContractBuilder<TBody, TQuery, T> {
        return new ContractBuilder(this.schemas.body, this.schemas.query, schema);
    }

    /**
     * Build the final validation schema
     *
     * @description
     * Combines all defined schemas (body, query, params) into a single
     * Zod object schema. This final schema can be used by validation
     * middleware to validate incoming requests.
     *
     * @returns Combined Zod schema with body, query, and params properties
     *
     * @example Building and using the contract
     * ```typescript
     * const updateUserContract = createContract()
     *   .params(z.object({ id: z.string().uuid() }))
     *   .body(z.object({
     *     name: z.string().optional(),
     *     email: z.string().email().optional()
     *   }))
     *   .query(z.object({
     *     notify: z.coerce.boolean().default(true)
     *   }))
     *   .build();
     *
     * // Result type:
     * // {
     * //   body: { name?: string; email?: string };
     * //   query: { notify: boolean };
     * //   params: { id: string };
     * // }
     * ```
     *
     * @example Type inference
     * ```typescript
     * const contract = createContract()
     *   .body(z.object({ data: z.string() }))
     *   .build();
     *
     * type ContractInput = z.infer<typeof contract>;
     * // ContractInput = {
     * //   body: { data: string },
     * //   query: {},
     * //   params: {}
     * // }
     * ```
     */
    build() {
        return z.object(this.schemas);
    }
}

/**
 * Factory function to create a new contract builder
 *
 * @description
 * Creates a new instance of ContractBuilder with empty schemas.
 * This is the recommended way to start building a contract.
 *
 * @returns New ContractBuilder instance with empty schemas
 *
 * @example Complete contract creation
 * ```typescript
 * // Create a contract for user registration
 * const registerContract = createContract()
 *   .body(z.object({
 *     email: z.string().email(),
 *     password: z.string().min(8).max(100),
 *     username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
 *     terms: z.literal(true, {
 *       errorMap: () => ({ message: "You must accept the terms" })
 *     })
 *   }))
 *   .build();
 *
 * // Create a contract for fetching users with filters
 * const getUsersContract = createContract()
 *   .query(z.object({
 *     page: z.coerce.number().min(1).default(1),
 *     limit: z.coerce.number().min(1).max(100).default(10),
 *     role: z.enum(['admin', 'user', 'moderator']).optional(),
 *     active: z.coerce.boolean().optional()
 *   }))
 *   .build();
 *
 * // Create a contract for updating a specific user
 * const updateUserContract = createContract()
 *   .params(z.object({
 *     userId: z.string().uuid()
 *   }))
 *   .body(z.object({
 *     email: z.string().email(),
 *     profile: z.object({
 *       bio: z.string().max(500),
 *       avatar: z.string().url()
 *     }).partial()
 *   }).partial())
 *   .build();
 * ```
 *
 * @example Integration with Express middleware
 * ```typescript
 * import { validate } from './middleware/validate';
 *
 * const createPostContract = createContract()
 *   .body(z.object({
 *     title: z.string().min(1).max(200),
 *     content: z.string().min(1),
 *     tags: z.array(z.string()).max(5).optional()
 *   }))
 *   .build();
 *
 * app.post('/api/posts',
 *   validate(createPostContract),
 *   async (req, res) => {
 *     // req.body is now type-safe and validated
 *     const { title, content, tags } = req.body;
 *     // ...
 *   }
 * );
 * ```
 */
export const createContract = () => new ContractBuilder();