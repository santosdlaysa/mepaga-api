import { Group, CreateGroupInput } from "../entities/Group";

export interface IGroupRepository {
  create(input: CreateGroupInput & { inviteToken: string }): Promise<Group>;
  findById(id: number): Promise<Group | null>;
  findByInviteToken(token: string): Promise<Group | null>;
  addMember(groupId: number, userId: number): Promise<void>;
  isMember(groupId: number, userId: number): Promise<boolean>;
}
