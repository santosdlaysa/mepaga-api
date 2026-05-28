import { PrismaClient } from "../../generated/prisma/client";
import { IGroupRepository } from "../../domain/repositories/IGroupRepository";
import { Group, CreateGroupInput } from "../../domain/entities/Group";

export class PrismaGroupRepository implements IGroupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateGroupInput & { inviteToken: string }): Promise<Group> {
    return this.prisma.group.create({
      data: {
        name: input.name,
        category: input.category,
        inviteToken: input.inviteToken,
      },
    });
  }

  async findById(id: string): Promise<Group | null> {
    return this.prisma.group.findUnique({ where: { id } });
  }

  async findByInviteToken(token: string): Promise<Group | null> {
    return this.prisma.group.findUnique({ where: { inviteToken: token } });
  }

  async addMember(groupId: string, userId: string): Promise<void> {
    await this.prisma.groupMember.create({
      data: { groupId, userId },
    });
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    return member !== null;
  }
}
