export interface SocialField {
  username: string;
  isPrivate: boolean;
}
export interface Member {
  id: number;
  username: string;
  created: Date;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  discordUsername: string;
  discordId: number;
  preview?: string;
  major?: string;
  gradDate?: Date;
  linkedin?: SocialField;
  github?: SocialField;
  leetcode?: SocialField;
  resumeUrl?: string;
  local?: string;
  bio?: string;
  groups?: { name: string }[];
  profilePictureUrl?: string;
}
export interface RawMemberData {
  id: number;
  username: string;
  created: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  discord_id: number;
  discord_username: string;
  major?: string;
  preview?: string;
  grad_date?: string;
  linkedin?: SocialField;
  github?: SocialField;
  leetcode?: SocialField;
  resume_url?: string;
  local?: string;
  bio?: string;
  groups?: { name: string }[];
  profile_picture_url?: string;
}

export interface DetailedResponse {
  detail: string;
}
