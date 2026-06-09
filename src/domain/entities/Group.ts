export interface Group {
  id: number;
  name: string;
  category: string;
  inviteToken: string;
  createdByUserId: number | null;
  createdAt: Date;
}

export interface CreateGroupInput {
  name: string;
  category: string;
}
