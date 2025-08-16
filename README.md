# Express Service

![Node.js](https://img.shields.io/badge/Node.js-23.8.0-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)
![Express](https://img.shields.io/badge/Express-4.21.2-lightgrey?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-6.12.0-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.4-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![License](https://img.shields.io/badge/License-Apache%202.0-green)

A production-ready Express.js boilerplate with TypeScript, Prisma ORM, Docker configuration, and automatic route loading. Built for rapid backend development with type-safe validation and modern development practices.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd express-service
cp .env.example .env

# Configure environment (REQUIRED: Set JWT_SECRET)
# Edit .env file with your configuration

# Start development environment
npm run dev

# Your API is now running at http://localhost:3333
```

## 📁 Project Structure

```
express-service/
├── src/
│   ├── contracts/          # Zod validation schemas (fluent builder pattern)
│   ├── controllers/        # Business logic handlers
│   ├── middlewares/        # Express middlewares (auth, validation)
│   ├── routes/            # Route definitions (auto-loaded)
│   ├── services/          # External services (Prisma, etc.)
│   ├── RouteLoader.ts     # Automatic route discovery
│   └── index.ts           # Application entry point
├── prisma/
│   ├── schema/            # Prisma schema files
│   └── seed.ts           # Database seeding
├── api-playground/        # HTTP test files
├── .env.example          # Environment template
├── compose.dev.yaml      # Development Docker setup
└── compose.yaml          # Production Docker setup
```

## 🛠️ Commands Reference

### Development
- `npm run dev` - Start full development stack (app + database + Prisma Studio)
- `npm run dev:logs` - View server logs
- `npm run dev:restart` - Restart development server
- `npm run dev:clean` - Stop and remove all containers/volumes

### Production
- `npm run prod` - Deploy production environment
- `npm run prod:logs` - View production logs
- `npm run prod:restart` - Restart production server

### Database (Development)
- `npm run prisma:dev:migrate` - Create and apply migrations
- `npm run prisma:dev:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:dev:generate` - Generate Prisma client
- `npm run prisma:dev:seed` - Seed database with initial data

### Local Development (without Docker)
- `npm run local:dev` - Start with hot reload
- `npm run build` - Build for production
- `npm start` - Run built application

## 🔧 Creating Your First Feature

### 1. Create a Contract (Validation Schema)

Use the fluent builder pattern to create type-safe validation:

```typescript
// src/contracts/user/schemas/UserSchemas.ts
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().min(18).optional()
});

export const UserParamsSchema = z.object({
  id: z.string().uuid()
});
```

```typescript
// src/contracts/user/contracts/UserContracts.ts
import { createContract } from "@/contracts";
import { CreateUserSchema, UserParamsSchema } from "../schemas";

export const CreateUserContract = createContract()
  .body(CreateUserSchema)
  .build();

export const GetUserContract = createContract()
  .params(UserParamsSchema)
  .query(z.object({
    includeProfile: z.coerce.boolean().default(false)
  }))
  .build();
```

### 2. Create a Controller

```typescript
// src/controllers/UserController.ts
import { Request, Response } from "express";
import { ValidatedRequest } from "@/middlewares";
import { CreateUserContract, GetUserContract } from "@/contracts";

export class UserController {
  static async createUser(request: Request, response: Response) {
    const validatedRequest = request as ValidatedRequest<typeof CreateUserContract>;
    const { email, name, age } = validatedRequest.validated.body;
    
    // Your business logic here
    response.status(201).json({ 
      message: "User created", 
      user: { email, name, age } 
    });
  }

  static async getUser(request: Request, response: Response) {
    const validatedRequest = request as ValidatedRequest<typeof GetUserContract>;
    const { id } = validatedRequest.validated.params;
    const { includeProfile } = validatedRequest.validated.query;
    
    // Your business logic here
    response.json({ id, includeProfile });
  }
}
```

### 3. Create Routes

```typescript
// src/routes/users.ts
import { Router } from "express";
import { validateContract, checkAuthentication } from "@/middlewares";
import { CreateUserContract, GetUserContract } from "@/contracts";
import { UserController } from "@/controllers";

export default function (router: Router) {
  router.post(
    "/users",
    validateContract(CreateUserContract),
    UserController.createUser
  );

  router.get(
    "/users/:id",
    checkAuthentication,
    validateContract(GetUserContract), 
    UserController.getUser
  );

  return router;
}
```

### 4. Export Your Contracts

```typescript
// src/contracts/user/contracts/index.ts
export * from "./UserContracts";

// src/contracts/index.ts
export * from "./ContractBuilder";
export * from "./user/contracts";
```

That's it! Your routes are automatically loaded and your endpoints are now available with full type safety.

## 🏗️ Contract Builder Features

The fluent builder pattern provides a clean, type-safe way to define validation:

```typescript
// Complex contract example
const UpdatePostContract = createContract()
  .params(z.object({
    postId: z.string().uuid(),
    userId: z.string().uuid()
  }))
  .body(z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    tags: z.array(z.string()).max(5).optional(),
    published: z.boolean().default(false)
  }).partial()) // Makes all fields optional for PATCH
  .query(z.object({
    notify: z.coerce.boolean().default(true),
    reason: z.string().optional()
  }))
  .build();
```

**Benefits:**
- **Type Safety**: Full TypeScript inference for request data
- **Immutable**: Each method returns a new instance
- **Fluent API**: Chain methods in any order
- **Auto-completion**: IDE support for validation rules

## 🐳 Docker Development

The project includes optimized Docker configurations:

- **Development**: Hot reload, mounted volumes, exposed database
- **Production**: Multi-stage build, non-root user, health checks
- **Prisma Studio**: Available on port 5555 in development

## 🔒 Environment Configuration

Required environment variables:

```bash
# .env
JWT_SECRET=your-super-secret-key  # REQUIRED
SERVICE_PORT=3333
POSTGRES_PASSWORD=your-password
DATABASE_URL="postgresql://..."
```

## 📡 API Testing

Use the included HTTP files in `api-playground/` with your IDE's REST client:

```http
### Test endpoint
GET {{BASE_URL}}/test?name=John&description=Test&phone=1234567890
```

## 🚀 Deployment

1. Configure production environment variables
2. Run `npm run prod` for containerized deployment
3. Use `npm run prisma:prod:migrate` for database migrations

---

**Ready to build? Start with `npm run dev` and create your first route!**