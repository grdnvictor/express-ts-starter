import { PrismaClient } from "@/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

class PrismaService {
  private static prismaClient: PrismaClient;

  private constructor() {
    // workaround pour que TS ne pète pas un boulard avec le type
    // mais jsp si c'est la bonne solution
    PrismaService.prismaClient = new PrismaClient().$extends(
      withAccelerate(),
    ) as unknown as PrismaClient;
  }

  static getInstance(): PrismaClient {
    if (!PrismaService.prismaClient) {
      new PrismaService();
    }
    return PrismaService.prismaClient;
  }
}

export const prismaClient = PrismaService.getInstance();
