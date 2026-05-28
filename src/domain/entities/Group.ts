export interface Group {
  id: string;
  name: string;
  category: string;
  inviteToken: string;
  createdAt: Date;
}

export interface CreateGroupInput {
  name: string;
  category: string;
}
