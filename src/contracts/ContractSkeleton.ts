import { z } from "zod";

export type ContractSkeletonType<
  BodyType,
  QueryType = unknown,
  ParamsType = unknown,
> = z.ZodObject<{
  body: z.ZodType<BodyType>;
  query: z.ZodType<QueryType>;
  params: z.ZodType<ParamsType>;
}>;
