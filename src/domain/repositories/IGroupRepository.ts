import { Group, CreateGroupInput } from "../entities/Group";

export interface IGroupRepository {
  create(input: CreateGroupInput & { inviteToken: string }): Promise<Group>;
  findById(id: string): Promise<Group | null>;
  findByInviteToken(token: string): Promise<Group | null>;
  addMember(groupId: string, userId: string): Promise<void>;
  isMember(groupId: string, userId: string): Promise<boolean>;
}
