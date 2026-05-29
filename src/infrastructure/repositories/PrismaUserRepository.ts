import { PrismaClient } from "../../generated/prisma/client";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User, CreateUserInput } from "../../domain/entities/User";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email ?? null,
        passwordHash: input.passwordHash ?? null,
        pixKey: input.pixKey ?? null,
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateEmail(userId: number, email: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { email },
    });
  }

  async setResetCode(userId: number, code: string, expiresAt: Date): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { resetCode: code, resetCodeExpiresAt: expiresAt },
    });
  }

  async clearResetCode(userId: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { resetCode: null, resetCodeExpiresAt: null },
    });
  }

  async updatePassword(userId: number, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, resetCode: null, resetCodeExpiresAt: null },
    });
  }
}
