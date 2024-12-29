export interface SocialField {
  username: string;
  isPrivate: boolean;
}

export interface InterviewAvailability {
  userId: number;
  availability: boolean[][];
}

export interface InterviewPool {
  member: Member;
}

export type Status = 'pending' | 'active' | 'inactive';

export interface Interview {
  interviewId: string;
  interviewer: number;
  technicalQuestions?: TechnicalQuestion[];
  behavioralQuestions?: BehavioralQuestion[];
  interviewee: number;
  status: Status;
  dateEffective: Date;
  dateCompleted?: Date;
}

export interface RawHydratedInterview {
  interviewId: string;
  interviewer: Member;
  technical_questions?: TechnicalQuestion[];
  behavioral_questions?: BehavioralQuestion[];
  interviewee: Member;
  status: Status;
  date_completed?: Date;
  date_effective: Date;
}

export interface HydratedInterview {
  interviewId: string;
  interviewer: Member;
  technicalQuestions?: TechnicalQuestion[];
  behavioralQuestions?: BehavioralQuestion[];
  interviewee: Member;
  status: Status;
  dateEffective: Date;
  dateCompleted?: Date;
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

export interface QuestionTopic {
  topicId: string;
  created: string;
  name: string;
}

export interface BaseQuestion {
  questionId: string;
  created: Date;
  prompt: string;
}

export interface RawBehavioralQuestion {
  question_id: string;
  created: string;
  created_by: Member;
  approved_by: Member;
  last_assigned: string;
  prompt: string;
  solution: string;
  follow_ups: string;
  source: string;
}

export interface BehavioralQuestion extends BaseQuestion {
  createdBy: Member;
  solution: string;
  approvedBy?: Member;
  lastAssigned?: Date;
  followUps?: string;
  source?: string;
}

export enum QuestionType {
  Technical = 'technical',
  Behavioral = 'behavioral',
}
export interface DetailedResponse {
  detail: string;
}

export interface RawInterviewData {
  interview_id: string;
  date_effective: string;
  date_completed: string;
  interviewer: number;
  interviewee: number;
  status: Status;
  technical_questions: RawTechnicalQuestion[];
  behavioral_questions: RawBehavioralQuestion[];
}
export interface RawInterviewAvailabilityData {
  user_id: number;
  availability: boolean[][];
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

export interface Topic {
  topicId: string;
  created: Date;
  createdBy: Member;
  name: string;
}

export interface RawTopic {
  topic_id: string;
  created: string;
  created_by: Member;
  name: string;
}

export interface TechnicalQuestion extends BaseQuestion {
  title: string;
  createdBy: string;
  approvedBy: string;
  lastAssigned: Date | undefined;
  topic: string;
  topicName: string;
  solution: string;
  followUps: string;
  source: string;
}

export type Question = TechnicalQuestion | BehavioralQuestion;

export interface RawTechnicalQuestion {
  question_id: string;
  title: string;
  created: string;
  created_by: string;
  approved_by: string;
  last_assigned: string;
  topic: Partial<RawTopic>;
  prompt: string;
  solution: string;
  follow_ups: string;
  source: string;
}

export enum ReportType {
  Interview = 'interview',
  Question = 'question',
  Member = 'member',
}

export enum ReportStatus {
  Pending = 'pending',
  Resolving = 'resolving',
  Completed = 'completed',
}

export interface RawReportBody {
  associated_id: string;
  reporter_user_id?: number;
  type: ReportType;
  reason: string;
}

export interface ReportBody {
  associatedId: string;
  reporterUserId?: number;
  type: ReportType;
  reason: string;
}

export type ReportObject = TechnicalQuestion | Member | HydratedInterview;
export type RawReportObject =
  | RawTechnicalQuestion
  | RawMemberData
  | RawHydratedInterview;

export interface RawReport {
  created: string;
  reason: string;
  report_id: string;
  reporter: RawMemberData;
  status: ReportStatus;
  type: ReportType;
  updated: string;
  admin_id?: string;
  admin_notes?: string;
  associated_id?: string;
  associated_object?: RawReportObject;
}

export interface Report {
  created: Date;
  reason: string;
  reportId: string;
  reporter: Member;
  status: ReportStatus;
  type: ReportType;
  updated: Date;
  adminId?: string;
  adminNotes?: string;
  associatedId?: string;
  associatedObject?: ReportObject;
}

export interface RawInterViewPoolStatus {
  number_sign_up: number;
  members: string[];
}

export interface InterviewPoolStatus {
  numberSignUp: number;
  members: string[];
}

export interface RawSignup {
  timestamp: number;
  username: string;
  user_id: string;
}
