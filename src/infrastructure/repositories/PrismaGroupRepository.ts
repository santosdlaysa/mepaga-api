import { PrismaClient } from "../../generated/prisma/client";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { Group, CreateGroupInput } from "../../domain/entities/Group";

export class PrismaGroupRepository implements IGroupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    input: CreateGroupInput & { inviteToken: string; createdByUserId: number }
  ): Promise<Group> {
    return this.prisma.group.create({
      data: {
        name: input.name,
        category: input.category,
        inviteToken: input.inviteToken,
        createdByUserId: input.createdByUserId,
      },
    });
  }

  async findById(id: number): Promise<Group | null> {
    return this.prisma.group.findUnique({ where: { id } });
  }

  async findByInviteToken(token: string): Promise<Group | null> {
    return this.prisma.group.findUnique({ where: { inviteToken: token } });
  }

  async addMember(groupId: number, userId: number): Promise<void> {
    await this.prisma.groupMember.create({
      data: { groupId, userId },
    });
  }

  async isMember(groupId: number, userId: number): Promise<boolean> {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    return member !== null;
  }

  async countMembers(groupId: number): Promise<number> {
    return this.prisma.groupMember.count({ where: { groupId } });
  }

  async delete(id: number): Promise<void> {
    // Membros, despesas e divisões são removidos em cascata (onDelete: Cascade).
    await this.prisma.group.delete({ where: { id } });
  }
}
